import { Router } from 'express';
import { store, persistCall } from '../db.js';

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
  status: c.status || 'ABERTO',
  timeline: Array.isArray(c.timeline) && c.timeline.length > 0 ? c.timeline : [
    {
      step: 'Chamado Aberto',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      description: c.problemDescription || c.description || 'Atendimento técnico registrado no sistema'
    }
  ]
});

// Insere ou substitui um chamado no cache em memória
const upsertInStore = (call) => {
  const idx = store.calls.findIndex(c => c.id === call.id);
  if (idx === -1) {
    store.calls.unshift(call);
  } else {
    store.calls[idx] = call;
  }
  return call;
};

const toMillis = (v) => {
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
};

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

    const existing = store.calls.find(c => c.id === rawCall.id);
    const newCall = formatCall(existing ? { ...existing, ...req.body } : rawCall);
    upsertInStore(newCall);

    // Persistência no Supabase
    await persistCall(newCall);

    res.status(existing ? 200 : 201).json(newCall);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/calls/:id — sincronização completa do chamado (status, timeline, técnico...)
// Regra "última escrita vence" baseada em updatedAt para não sobrescrever com dados antigos.
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = store.calls.find(c => c.id === id);

    if (existing && toMillis(existing.updatedAt) > toMillis(req.body.updatedAt)) {
      return res.json(formatCall(existing));
    }

    const merged = formatCall({
      ...(existing || { createdAt: new Date().toISOString() }),
      ...req.body,
      id,
      updatedAt: req.body.updatedAt || new Date().toISOString()
    });
    upsertInStore(merged);
    await persistCall(merged);

    res.status(existing ? 200 : 201).json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/calls/:id/status
router.patch('/:id/status', async (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  store.calls[idx] = { ...store.calls[idx], status, updatedAt: new Date().toISOString() };
  await persistCall(store.calls[idx]);
  res.json(formatCall(store.calls[idx]));
});

// PATCH /api/v1/calls/:id/reassign
router.patch('/:id/reassign', async (req, res) => {
  const technicianId = req.query.technicianId || req.body.technicianId;
  const technicianName = req.query.technicianName || req.body.technicianName;

  const idx = store.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  store.calls[idx] = { ...store.calls[idx], technicianId, technicianName, updatedAt: new Date().toISOString() };
  await persistCall(store.calls[idx]);
  res.json(formatCall(store.calls[idx]));
});

export default router;
