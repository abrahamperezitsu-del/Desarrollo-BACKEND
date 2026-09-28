import { generateId } from '../../data/requests.js'
import { STATUS, TERMINAL_STATUSES, isValidTransition, canModifyStatus } from './request-status.js'

export const requests = []
let nextId = 1

export function findById(id) {
  return requests.find((item) => item.id === id)
}

export function create(data) {
  const request = {
    id: generateId(),
    title: data.title,
    description: data.description ?? '',
    priority: data.priority ?? 'medium',
    status: STATUS.OPEN,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  requests.push(request)
  return request
}

export function update(id, data) {
  const request = findById(id)
  if (!request) return null

  if (data.status && canModifyStatus(request.status)) {
    if (!isValidTransition(request.status, data.status)) {
      const error = new Error('Invalid transition')
      error.code = 'TRANSITION_INVALID'
      throw error
    }
    request.status = data.status
  }

  if (data.title !== undefined) request.title = data.title
  if (data.description !== undefined) request.description = data.description
  if (data.priority !== undefined) request.priority = data.priority

  request.updatedAt = new Date()
  return request
}

export function filterByStatus(status) {
  return requests.filter((item) => item.status === status)
}

export function filterByPriority(priority) {
  return requests.filter((item) => item.priority === priority)
}

export function generateIdFn() {
  const id = nextId
  nextId = nextId + 1
  return id
}