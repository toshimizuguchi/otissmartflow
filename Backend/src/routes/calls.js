import { Router } from 'express';
import { store, pool } from '../db.js';

const router = Router();

// Função auxiliar para normalizar e garantir que nenhum campo vital seja undefined
const formatCall = (c) => ({
  ...c,
  callNumber: c.callNumber || c.code || c.id,
  customerName: c.customerName || c.clientName || 'Cliente OTIS',
  equipmentTag: c.equipmentTag || c.equipmentCode || c.equipmentId || 'ELV-01',
  problemDescription: c.problemDescription || c.description || 'Atendimento técnico preventivo/corretivo',
  buildingName: c.buildingName || c.address || 'Edifício Corporativo',
  city: c.city || 'São Paulo',
  priority: c.priority || 'NORMAL',
  status: c.status || 'ABERTO'
});

// GET /api/v1/calls
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  let list = store.calls.map(formatCall);

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
  res.json(formatCall(item));
});

// POST /api/v1/calls
router.post('/', async (req, res) => {
  try {
    const rawCall = {
      id: req.body.id || `CAL-${Date.now().toString().slice(-4)}`,
      code: req.body.code || req.body.callNumber || `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'ABERTO',
      priority: req.body.priority || 'NORMAL',
      ...req.body
    };

    const newCall = formatCall(rawCall);
    store.calls.unshift(newCall);

    // Persistência assíncrona no Supabase
    pool.query(
      'INSERT INTO calls (id, code, equipment_id, client_name, status, priority, technician_id, technician_name, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET data = $9',
      [newCall.id, newCall.callNumber, newCall.equipmentId || '', newCall.customerName, newCall.status, newCall.priority, newCall.technicianId || '', newCall.technicianName || '', newCall]
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
  res.json(formatCall(store.calls[idx]));
});

// PATCH /api/v1/calls/:id/reassign
router.patch('/:id/reassign', (req, res) => {
  const technicianId = req.query.technicianId || req.body.technicianId;
  const technicianName = req.query.technicianName || req.body.technicianName;

  const idx = store.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  store.calls[idx].technicianId = technicianId;
  store.calls[idx].technicianName = technicianName;
  res.json(formatCall(store.calls[idx]));
});

export default router;
