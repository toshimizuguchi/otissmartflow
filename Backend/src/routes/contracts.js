import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/contracts
router.get('/', (req, res) => {
  const { status } = req.query;
  let list = store.contracts;

  if (status) {
    list = list.filter(c => c.status?.toUpperCase() === status.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/contracts/:id
router.get('/:id', (req, res) => {
  const item = store.contracts.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Contrato não encontrado' });
  res.json(item);
});

// POST /api/v1/contracts
router.post('/', (req, res) => {
  const newContract = {
    id: req.body.id || `CTR-${Date.now().toString().slice(-4)}`,
    ...req.body
  };
  store.contracts.unshift(newContract);
  res.status(201).json(newContract);
});

// PATCH /api/v1/contracts/:id/status
router.patch('/:id/status', (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.contracts.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Contrato não encontrado' });

  store.contracts[idx].status = status;
  res.json(store.contracts[idx]);
});

export default router;
