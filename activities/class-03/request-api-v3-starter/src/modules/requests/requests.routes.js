import express from 'express'
import {
  create,
  findById,
  update,
  filterByStatus,
  filterByPriority,
  requests
} from './requests.store.js'

const router = express.Router()

router.get('/', (req, res) => {
  const statusFilter = req.query.status
  const priorityFilter = req.query.priority

  let results = requests

  if (statusFilter) {
    results = filterByStatus(statusFilter)
  }

  if (priorityFilter) {
    results = filterByPriority(priorityFilter)
  }

  res.status(200).json(results)
})

router.get('/:id', (req, res) => {
  const request = findById(Number(req.params.id))

  if (!request) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } })
  }

  res.status(200).json(request)
})

router.post('/', (req, res) => {
  const { title, description, priority } = req.body

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Title is required' } })
  }

  try {
    const request = create({ title: title.trim(), description, priority })
    res.status(201).json(request)
  } catch (error) {
    res.status(400).json({ error: { code: error.code || 'VALIDATION_ERROR', message: error.message } })
  }
})

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)

  const request = findById(id)

  if (!request) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } })
  }

  if (request.status && TERMINAL_STATUSES.includes(request.status) && req.body.status) {
    return res.status(409).json({ error: { code: 'TRANSITION_TERMINAL', message: 'Cannot modify a terminal request' } })
  }

  try {
    const updated = update(id, req.body)

    if (!updated) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } })
    }

    res.status(200).json(updated)
  } catch (error) {
    if (error.code === 'TRANSITION_INVALID') {
      return res.status(409).json({ error: { code: 'TRANSITION_INVALID', message: error.message } })
    }
    res.status(400).json({ error: { code: error.code || 'VALIDATION_ERROR', message: error.message } })
  }
})

export default router