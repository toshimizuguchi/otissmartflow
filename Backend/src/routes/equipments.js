import { Router } from 'express';
import { store, pool } from '../db.js';

const router = Router();

const formatEquipment = (e) => ({
  ...e,
  tag: e.tag || e.code || e.id,
  name: e.name || e.model || 'Elevador OTIS Gen2',
  customerName: e.customerName || e.clientName || 'Cliente OTIS',
  buildingName: e.buildingName || e.address || 'Edifício Corporativo',
  city: e.city || 'São Paulo',
  riskLevel: e.riskLevel || 'BAIXO',
  status: e.status || 'OPERACIONAL'
});

// GET /api/v1/equipments
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let list = store.equipments.map(formatEquipment);

    if (city && city !== 'TODAS') {
      list = list.filter(e => e.city?.toLowerCase() === city.toLowerCase());
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/equipments/risk/:riskLevel
router.get('/risk/:riskLevel', (req, res) => {
  const { riskLevel } = req.params;
  const filtered = store.equipments
    .map(formatEquipment)
    .filter(e => e.riskLevel?.toUpperCase() === riskLevel.toUpperCase());
  res.json(filtered);
});

// GET /api/v1/equipments/:id
router.get('/:id', (req, res) => {
  const item = store.equipments.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Equipamento não encontrado' });
  res.json(formatEquipment(item));
});

// POST /api/v1/equipments
router.post('/', async (req, res) => {
  try {
    const rawEq = {
      id: req.body.id || `EQ-${Date.now().toString().slice(-4)}`,
      tag: req.body.tag || req.body.code || `OTIS-${Date.now().toString().slice(-4)}`,
      ...req.body
    };
    const newEq = formatEquipment(rawEq);
    store.equipments.unshift(newEq);

    // Tenta persistir no Supabase
    pool.query(
      'INSERT INTO equipments (id, code, model, client_name, city, status, risk_level, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET data = $8',
      [newEq.id, newEq.tag, newEq.model || '', newEq.customerName, newEq.city, newEq.status, newEq.riskLevel, newEq]
    ).catch(() => {});

    res.status(201).json(newEq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/equipments/:id/status
router.patch('/:id/status', (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.equipments.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Equipamento não encontrado' });

  store.equipments[idx].status = status;
  res.json(formatEquipment(store.equipments[idx]));
});

export default router;
