import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/alerts
router.get('/', (req, res) => {
  const { status } = req.query;
  let list = store.alerts;

  if (status === 'RESOLVED') {
    list = list.filter(a => a.isResolved);
  } else if (status === 'UNRESOLVED') {
    list = list.filter(a => !a.isResolved);
  }

  res.json(list);
});

// PATCH /api/v1/alerts/:id/resolve
router.patch('/:id/resolve', (req, res) => {
  const resolutionNote = req.query.resolutionNote || req.body.resolutionNote || 'Resolvido via SmartFlow';
  const idx = store.alerts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Alerta não encontrado' });

  store.alerts[idx].isResolved = true;
  store.alerts[idx].resolutionNote = resolutionNote;
  res.json(store.alerts[idx]);
});

// PATCH /api/v1/alerts/:id/read
router.patch('/:id/read', (req, res) => {
  const idx = store.alerts.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Alerta não encontrado' });

  store.alerts[idx].isRead = true;
  res.json(store.alerts[idx]);
});

// POST /api/v1/alerts/read-all
router.post('/read-all', (req, res) => {
  store.alerts.forEach(a => { a.isRead = true; });
  res.status(204).send();
});

export default router;
