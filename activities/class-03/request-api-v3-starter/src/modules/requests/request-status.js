export const STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
}

export const TERMINAL_STATUSES = [STATUS.CLOSED, STATUS.CANCELLED]

export const VALID_TRANSITIONS = {
  [STATUS.OPEN]: [STATUS.IN_PROGRESS, STATUS.RESOLVED, STATUS.CLOSED, STATUS.CANCELLED],
  [STATUS.IN_PROGRESS]: [STATUS.RESOLVED, STATUS.CLOSED, STATUS.CANCELLED],
  [STATUS.RESOLVED]: [STATUS.CLOSED, STATUS.CANCELLED],
  [STATUS.CLOSED]: [],
  [STATUS.CANCELLED]: []
}

export function isValidTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from]
  return allowed && allowed.includes(to)
}

export function canModifyStatus(status) {
  return !TERMINAL_STATUSES.includes(status)
}