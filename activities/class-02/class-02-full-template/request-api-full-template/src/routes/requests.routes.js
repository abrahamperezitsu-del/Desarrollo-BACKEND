import { Router } from 'express';
import { requests, generateId } from '../data/requests.js';

const router = Router();

// GET /requests (Listar solicitudes, con filtrado opcional)
router.get('/', (req, res) => {
  const { status } = req.query;
  
  let result = requests;
  if (status) {
    result = requests.filter(r => r.status === status);
  }
  
  res.status(200).json(result);
});

// GET /requests/:id (Obtener solicitud por ID)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(200).json(request);
});

// POST /requests (Crear nueva solicitud)
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newRequest = {
    id: generateId(),
    title: title,
    description: description || '',
    status: 'open'
  };

  requests.push(newRequest);

  res.status(201).json(newRequest);
});

export default router;