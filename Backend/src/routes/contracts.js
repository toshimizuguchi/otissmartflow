import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

const formatContract = (c) => ({
  ...c,
  contractNumber: c.contractNumber || c.code || c.id,
  customerName: c.customerName || c.clientName || 'Cliente Corporativo OTIS',
  monthlyRevenue: c.monthlyRevenue ?? c.monthlyValue ?? 15000,
  monthlyPartsCost: c.monthlyPartsCost ?? (c.costAccumulated ? c.costAccumulated * 0.4 : 3500),
  monthlyTechLaborCost: c.monthlyTechLaborCost ?? (c.costAccumulated ? c.costAccumulated * 0.6 : 4500),
  currentMarginRate: c.currentMarginRate ?? c.marginPercent ?? 72,
  baselineMarginRate: c.baselineMarginRate || 25,
  equipmentsCount: c.equipmentsCount || c.equipmentCount || 6,
  slaRequiredRate: c.slaRequiredRate || c.slaTargetMin || 98,
  status: c.status || 'ATIVO'
});

// GET /api/v1/contracts
router.get('/', (req, res) => {
  const { status } = req.query;
  let list = store.contracts.map(formatContract);

  if (status) {
    list = list.filter(c => c.status?.toUpperCase() === status.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/contracts/:id
router.get('/:id', (req, res) => {
  const item = store.contracts.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Contrato não encontrado' });
  res.json(formatContract(item));
});

// POST /api/v1/contracts
router.post('/', (req, res) => {
  const raw = {
    id: req.body.id || `CTR-${Date.now().toString().slice(-4)}`,
    ...req.body
  };
  const newContract = formatContract(raw);
  store.contracts.unshift(newContract);
  res.status(201).json(newContract);
});

// PATCH /api/v1/contracts/:id/status
router.patch('/:id/status', (req, res) => {
  const status = req.query.status || req.body.status;
  const idx = store.contracts.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Contrato não encontrado' });

  store.contracts[idx].status = status;
  res.json(formatContract(store.contracts[idx]));
});

export default router;
