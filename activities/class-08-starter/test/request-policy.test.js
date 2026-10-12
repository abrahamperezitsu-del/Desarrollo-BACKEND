// Policy tests — INCOMPLETE, on purpose. This is the payoff of the whole
// class: once canClaimRequest depends on nothing, its entire behavior
// matrix runs here with plain objects. No HTTP. No PostgreSQL. No server.
//
// Convert each stub as you implement the policy. Look at the matrix in
// the FEATURE-801 brief: every row becomes one assertion.
import test from 'node:test';
import assert from 'node:assert/strict';
import { canClaimRequest } from '../src/modules/requests/request.policy.js';

test('an agent can claim an open, unassigned request', () => {
  const agent = { role: 'agent', userId: 'user-1' };
  const openUnassigned = { id: 1, title: 'test', status: 'open', assignedTo: null, createdBy: 'user-2' };
  const result = canClaimRequest({ actor: agent, request: openUnassigned });
  assert.equal(result.allowed, true);
});

test('a requester cannot claim, even an open request', () => {
  const requester = { role: 'requester', userId: 'user-1' };
  const openUnassigned = { id: 1, title: 'test', status: 'open', assignedTo: null, createdBy: 'user-2' };
  const result = canClaimRequest({ actor: requester, request: openUnassigned });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'NOT_AGENT');
});

test('an already assigned request cannot be claimed again', () => {
  const agent = { role: 'agent', userId: 'user-1' };
  const assigned = { id: 1, title: 'test', status: 'open', assignedTo: 'user-2', createdBy: 'user-3' };
  const result = canClaimRequest({ actor: agent, request: assigned });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'ALREADY_ASSIGNED');
});

test('a request that is not open cannot be claimed', () => {
  const agent = { role: 'agent', userId: 'user-1' };
  const states = ['in_progress', 'resolved', 'closed', 'cancelled'];
  states.forEach((status) => {
    const request = { id: 1, title: 'test', status: status, assignedTo: null, createdBy: 'user-2' };
    const result = canClaimRequest({ actor: agent, request });
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'NOT_OPEN');
  });
});

test('the role rule wins over the state rules', () => {
  const requester = { role: 'requester', userId: 'user-1' };
  const assigned = { id: 1, title: 'test', status: 'assigned', assignedTo: 'user-2', createdBy: 'user-3' };
  const result = canClaimRequest({ actor: requester, request: assigned });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'NOT_AGENT');
});
