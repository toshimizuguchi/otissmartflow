import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/technicians
router.get('/', (req, res) => {
  const { city, status } = req.query;
  let list = store.technicians;

  if (city && city !== 'TODAS') {
    list = list.filter(t => t.city?.toLowerCase() === city.toLowerCase());
  }

  if (status) {
    list = list.filter(t => t.status?.toUpperCase() === status.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/technicians/:id
router.get('/:id', (req, res) => {
  const item = store.technicians.find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Técnico não encontrado' });
  res.json(item);
});

export default router;
