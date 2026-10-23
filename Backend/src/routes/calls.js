import { Router } from 'express';
import { store, pool } from '../db.js';

const router = Router();

// GET /api/v1/calls
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  let list = store.calls;

  if (status) {
    list = list.filter(c => c.status?.toUpperCase() === status.toUpperCase());
  }

  if (priority) {
    list = list.filter(c => c.priority?.toUpperCase() === priority.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/calls/:id
router.get('/:id', (req, res) => {
  const item = store.calls.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Chamado não encontrado' });
  res.json(item);
});

// POST /api/v1/calls
router.post('/', async (req, res) => {
  try {
    const newCall = {
      id: req.body.id || `CAL-${Date.now().toString().slice(-4)}`,
      code: req.body.code || `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'ABERTO',
      priority: req.body.priority || 'NORMAL',
      ...req.body
    };

    store.calls.unshift(newCall);

    // Persistência assíncrona no Supabase
    pool.query(
      'INSERT INTO calls (id, code, equipment_id, client_name, status, priority, technician_id, technician_name, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET data = $9',
      [newCall.id, newCall.code, newCall.equipmentId || '', newCall.clientName || '', newCall.status, newCall.priority, newCall.technicianId || '', newCall.technicianName || '', newCall]
    ).catch(() => {});

    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/calls/:id/status
router.patch('/:id/status', (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  store.calls[idx].status = status;
  res.json(store.calls[idx]);
});

// PATCH /api/v1/calls/:id/reassign
router.patch('/:id/reassign', (req, res) => {
  const technicianId = req.query.technicianId || req.body.technicianId;
  const technicianName = req.query.technicianName || req.body.technicianName;

  const idx = store.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  store.calls[idx].technicianId = technicianId;
  store.calls[idx].technicianName = technicianName;
  res.json(store.calls[idx]);
});

export default router;
