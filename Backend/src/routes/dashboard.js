import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/dashboard/metrics
router.get('/metrics', (req, res) => {
  const totalEquipments = store.equipments.length;
  const normalEquipments = store.equipments.filter(e => e.status === 'NORMAL').length;
  const availabilityRate = totalEquipments > 0 ? ((normalEquipments / totalEquipments) * 100).toFixed(1) : 98.4;

  const totalCalls = store.calls.length;
  const activeCalls = store.calls.filter(c => c.status !== 'CONCLUIDO').length;
  const emergencyCalls = store.calls.filter(c => c.priority === 'EMERGENCIA' && c.status !== 'CONCLUIDO').length;

  const activeTechnicians = store.technicians.filter(t => t.status === 'EM_ATENDIMENTO').length;
  const availableTechnicians = store.technicians.filter(t => t.status === 'DISPONIVEL').length;

  const activeContracts = store.contracts.filter(c => c.status === 'ATIVO');
  const avgMargin = activeContracts.length > 0
    ? (activeContracts.reduce((acc, c) => acc + (c.marginPercent || 0), 0) / activeContracts.length).toFixed(1)
    : 72.5;

  res.json({
    fleetAvailabilityPercent: parseFloat(availabilityRate),
    totalEquipments,
    activeCallsCount: activeCalls,
    emergencyCallsCount: emergencyCalls,
    activeTechniciansCount: activeTechnicians,
    availableTechniciansCount: availableTechnicians,
    slaCompliancePercent: 96.8,
    averageMarginPercent: parseFloat(avgMargin),
    criticalAlertsCount: store.alerts.filter(a => a.severity === 'CRITICA' && !a.isResolved).length
  });
});

export default router;
