import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

const formatPart = (p) => ({
  ...p,
  unitCost: p.unitCost ?? p.priceUnit ?? 1500,
  compatibleModels: p.compatibleModels || ['Otis Gen2 Comfort', 'Otis SkyRise'],
  stockQuantity: p.stockQuantity ?? 10,
  minStockQuantity: p.minStockQuantity ?? 5
});

// GET /api/v1/parts
router.get('/', (req, res) => {
  const { category } = req.query;
  let list = store.parts.map(formatPart);

  if (category) {
    list = list.filter(p => p.category?.toUpperCase() === category.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/parts/abnormal
router.get('/abnormal', (req, res) => {
  const abnormal = store.parts.map(formatPart).filter(p => p.isAbnormalUsage || p.stockQuantity < p.minStockQuantity);
  res.json(abnormal);
});

// GET /api/v1/parts/requests
router.get('/requests', (req, res) => {
  const { status } = req.query;
  let list = store.partRequests;

  if (status) {
    list = list.filter(r => r.status?.toUpperCase() === status.toUpperCase());
  }

  res.json(list);
});

// POST /api/v1/parts/requests
router.post('/requests', (req, res) => {
  const newReq = {
    id: req.body.id || `REQ-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    status: req.body.status || 'PENDENTE',
    ...req.body
  };
  store.partRequests.unshift(newReq);
  res.status(201).json(newReq);
});

// PATCH /api/v1/parts/requests/:id/status
router.patch('/requests/:id/status', (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.partRequests.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Solicitação não encontrada' });

  store.partRequests[idx].status = status;
  res.json(store.partRequests[idx]);
});

// GET /api/v1/parts/:id
router.get('/:id', (req, res) => {
  const item = store.parts.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Peça não encontrada' });
  res.json(formatPart(item));
});

export default router;
