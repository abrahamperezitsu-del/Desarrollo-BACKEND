// ============================================================================
// STARTER NOTE — Stations 6 and 7 evolve this file. It arrives working
// exactly as in class 04 (with AppError now imported from the shared
// src/app-error.js). Target changes:
//
//   * every exported operation receives the actor first:
//       listRequests(actor, filters) · getRequest(actor, id)
//       createRequest(actor, input) · patchRequest(actor, id, body)
//       getHistory(actor, id)
//   * reject server-controlled fields explicitly (400 SERVER_CONTROLLED_FIELD):
//       id, createdBy, createdAt, updatedAt, changedBy — and status on POST;
//   * createRequest: createdBy = actor.userId (never from the body); the
//     birth history records the creator as changed_by;
//   * listRequests: requester -> scope with { createdBy: actor.userId } in
//     the store call; agent -> everything;
//   * getRequest/getHistory: a foreign request answers the SAME 404 as a
//     missing one (do not reveal existence);
//   * patchRequest: apply the policy BEFORE writing, all-or-nothing (a
//     mixed body with a forbidden field changes NOTHING -> 403), and pass
//     actor.userId as changedBy to insertStatusHistory;
//   * the class 3-4 rules stay: terminal states and transitions keep
//     answering 409 — for every role.
//
// New error categories available: AppError('forbidden', 'FORBIDDEN', ...)
// -> 403. See src/app-error.js.
// ============================================================================

import { withTransaction } from '../../database/transaction.js';
import {
  findAll,
  findById,
  insertRequest,
  updateRequest,
  insertStatusHistory,
  findHistory
} from './requests.store.js';
import { mapRequestRow, mapHistoryRow } from './request.mapper.js';
import { STATUSES, isValidStatus, isTerminal, canTransition } from './request-status.js';
import {
  canEditContent,
  canChangePriority,
  canChangeStatus
} from './request.policy.js';
import { AppError } from '../../app-error.js';

const PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'priority', 'status'];
const SERVER_CONTROLLED_FIELDS = ['id', 'createdBy', 'createdAt', 'updatedAt', 'changedBy'];

function assertValidPriority(priority) {
  if (!PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY',
      `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }
}

function assertRequesterScope(actor, resourceCreatedBy) {
  // Legacy requests (created_by IS NULL) are visible only to agents
  if (resourceCreatedBy === null) {
    if (actor.role !== 'agent') {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request not found.`);
    }
    return;
  }
  // Requester can only see their own requests
  if (actor.role === 'requester' && resourceCreatedBy !== actor.userId) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request not found.`);
  }
}

export async function listRequests(actor, filters) {
  if (filters.status !== undefined && !isValidStatus(filters.status)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown status "${filters.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (filters.priority !== undefined && !PRIORITIES.includes(filters.priority)) {
    throw new AppError('contract', 'INVALID_FILTER',
      `Unknown priority "${filters.priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  // Requester sees only their own; agent sees everything (including legacy)
  const scopeFilters = { ...filters };
  if (actor.role === 'requester') {
    scopeFilters.createdBy = actor.userId;
  }

  const rows = await findAll(scopeFilters);
  return rows.map(mapRequestRow);
}

export async function getRequest(actor, id) {
  const row = await findById(id);
  if (!row) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  assertRequesterScope(actor, row.created_by);
  return mapRequestRow(row);
}

export async function createRequest(actor, input) {
  const body = input ?? {};

  // Reject server-controlled fields in POST body
  for (const field of SERVER_CONTROLLED_FIELDS) {
    if (field in body) {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
        `The field "${field}" is controlled by the server.`);
    }
  }
  // Status is also server-controlled on creation
  if ('status' in body) {
    throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
      'The field "status" is controlled by the server.');
  }

  const { title, description, priority } = body;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }
  if (priority !== undefined) assertValidPriority(priority);

  // Creation is a unit of work: the request AND its birth history
  // (NULL -> open) happen together or not at all.
  const row = await withTransaction(async (client) => {
    const created = await insertRequest({
      title: title.trim(),
      description: typeof description === 'string' ? description : null,
      priority: priority ?? 'medium',
      createdBy: actor.userId
    }, client);
    await insertStatusHistory(created.id, null, created.status, actor.userId, client);
    return created;
  });

  return mapRequestRow(row);
}

export async function patchRequest(actor, id, body) {
  // Reject server-controlled fields in PATCH body
  for (const field of SERVER_CONTROLLED_FIELDS) {
    if (field in body) {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD',
        `The field "${field}" is controlled by the server.`);
    }
  }

  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body?.[field] !== undefined) changes[field] = body[field];
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError('contract', 'NO_UPDATABLE_FIELDS',
      `The body must include at least one of: ${UPDATABLE_FIELDS.join(', ')}.`);
  }
  if (changes.title !== undefined && (typeof changes.title !== 'string' || changes.title.trim() === '')) {
    throw new AppError('contract', 'TITLE_REQUIRED', 'The title cannot be empty.');
  }
  if (changes.priority !== undefined) assertValidPriority(changes.priority);
  if (changes.status !== undefined && !isValidStatus(changes.status)) {
    throw new AppError('contract', 'INVALID_STATUS',
      `Unknown status "${changes.status}". Valid values: ${STATUSES.join(', ')}.`);
  }
  if (changes.title !== undefined) changes.title = changes.title.trim();

  // Read, validate against the current state, write and record history —
  // all with the same client, as one unit of work.
  const row = await withTransaction(async (client) => {
    const current = await findById(id, client);
    if (!current) {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
    }

    // Ownership check: foreign request -> same 404 as missing
    assertRequesterScope(actor, current.created_by);

    // Authorization: apply policy BEFORE writing, all-or-nothing
    // Check what fields are being changed and verify permissions
    const hasContentChange = changes.title !== undefined || changes.description !== undefined;
    const hasPriorityChange = changes.priority !== undefined;
    const hasStatusChange = changes.status !== undefined && changes.status !== current.status;

    // Map current to camelCase for policy checks
    const currentMapped = mapRequestRow(current);

    // All-or-nothing: if ANY change is forbidden, reject the entire body
    if (hasContentChange && !canEditContent(actor, currentMapped)) {
      throw new AppError('forbidden', 'FORBIDDEN', 'You are not allowed to edit the content of this request.');
    }
    if (hasPriorityChange && !canChangePriority(actor)) {
      throw new AppError('forbidden', 'FORBIDDEN', 'You are not allowed to change the priority of this request.');
    }
    if (hasStatusChange && !canChangeStatus(actor)) {
      throw new AppError('forbidden', 'FORBIDDEN', 'You are not allowed to change the status of this request.');
    }

    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS',
        `Request ${id} is ${current.status} and can no longer be modified.`);
    }

    if (hasStatusChange && !canTransition(current.status, changes.status)) {
      throw new AppError('domain', 'INVALID_STATUS_TRANSITION',
        `A request cannot move from ${current.status} to ${changes.status}.`);
    }

    const updated = await updateRequest(id, changes, client);
    if (hasStatusChange) {
      await insertStatusHistory(id, current.status, changes.status, actor.userId, client);
    }
    return updated;
  });

  return mapRequestRow(row);
}

export async function getHistory(actor, id) {
  const request = await findById(id);
  if (!request) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }
  assertRequesterScope(actor, request.created_by);
  const rows = await findHistory(id);
  return rows.map(mapHistoryRow);
}
