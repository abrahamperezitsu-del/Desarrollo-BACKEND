// HTTP layer of the requests module: it extracts path, query, body and
// the authenticated actor, invokes the operation, and translates results
// and typed errors into HTTP responses. It contains no SQL and no domain
// rules. The router assumes app.js mounted it behind `authenticate`, so
// req.auth is always present here.

import express from 'express';
import {
  listRequests,
  getRequest,
  createRequest,
  patchRequest,
  getHistory
} from './requests.service.js';
import { AppError } from '../../app-error.js';

const router = express.Router();

function validateId(req, res, next) {
  const raw = req.params.id;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== String(raw).trim()) {
    return next(new AppError('contract', 'INVALID_REQUEST_ID', 'The request id must be a positive integer.'));
  }
  req.validatedId = parsed;
  next();
}

router.get('/', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    res.status(200).json(await listRequests(req.auth, { status, priority }));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    res.status(200).json(await getRequest(req.auth, req.validatedId));
  } catch (error) {
    next(error);
  }
});

router.get('/:id/history', validateId, async (req, res, next) => {
  try {
    res.status(200).json(await getHistory(req.auth, req.validatedId));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await createRequest(req.auth, req.body));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validateId, async (req, res, next) => {
  try {
    res.status(200).json(await patchRequest(req.auth, req.validatedId, req.body));
  } catch (error) {
    next(error);
  }
});

export default router;
