import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/campaigns
router.get('/', (req, res) => {
  const { status } = req.query;
  let list = store.campaigns;

  if (status) {
    list = list.filter(c => c.status?.toUpperCase() === status.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/campaigns/:id
router.get('/:id', (req, res) => {
  const item = store.campaigns.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Campanha não encontrada' });
  res.json(item);
});

// POST /api/v1/campaigns
router.post('/', (req, res) => {
  const newCamp = {
    id: req.body.id || `CMP-${Date.now().toString().slice(-4)}`,
    completedCount: req.body.completedCount || 0,
    status: req.body.status || 'EM_ANDAMENTO',
    ...req.body
  };
  store.campaigns.unshift(newCamp);
  res.status(201).json(newCamp);
});

// PATCH /api/v1/campaigns/:id/advance
router.patch('/:id/advance', (req, res) => {
  const count = parseInt(req.query.count || req.body.count || 1, 10);
  const idx = store.campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Campanha não encontrada' });

  store.campaigns[idx].completedCount += count;
  if (store.campaigns[idx].completedCount >= store.campaigns[idx].targetCount) {
    store.campaigns[idx].status = 'CONCLUIDA';
  }
  res.json(store.campaigns[idx]);
});

// DELETE /api/v1/campaigns/:id
router.delete('/:id', (req, res) => {
  const idx = store.campaigns.findIndex(c => c.id === req.params.id);
  if (idx !== -1) {
    store.campaigns.splice(idx, 1);
  }
  res.status(204).send();
});

export default router;
