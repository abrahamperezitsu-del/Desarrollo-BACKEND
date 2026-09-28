// Identifier for the next request that gets created.
let nextId = 1

// Returns a fresh identifier and prepares the following one.
export function generateId() {
  const id = nextId
  nextId = nextId + 1
  return id
}