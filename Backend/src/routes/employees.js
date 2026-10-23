import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// GET /api/v1/employees
router.get('/', (req, res) => {
  const { role } = req.query;
  let list = store.employees;

  if (role) {
    list = list.filter(e => e.role?.toUpperCase() === role.toUpperCase());
  }

  res.json(list);
});

// GET /api/v1/employees/punches
router.get('/punches', (req, res) => {
  const { employeeId } = req.query;
  let list = store.timePunches;

  if (employeeId) {
    list = list.filter(p => p.employeeId === employeeId);
  }

  res.json(list);
});

// POST /api/v1/employees/punches
router.post('/punches', (req, res) => {
  const newPunch = {
    id: req.body.id || `PCH-${Date.now().toString().slice(-4)}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    isWithinGeoFence: req.body.isWithinGeoFence ?? true,
    ...req.body
  };
  store.timePunches.unshift(newPunch);
  res.status(201).json(newPunch);
});

// PATCH /api/v1/employees/:id/bonus
router.patch('/:id/bonus', (req, res) => {
  const approved = req.query.approved === 'true' || req.body.approved === true;
  const idx = store.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Colaborador não encontrado' });

  store.employees[idx].bonusApproved = approved;
  res.json(store.employees[idx]);
});

// PATCH /api/v1/employees/:id/overtime
router.patch('/:id/overtime', (req, res) => {
  const approved = req.query.approved === 'true' || req.body.approved === true;
  const idx = store.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Colaborador não encontrado' });

  store.employees[idx].overtimeApproved = approved;
  res.json(store.employees[idx]);
});

// GET /api/v1/employees/:id
router.get('/:id', (req, res) => {
  const item = store.employees.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Colaborador não encontrado' });
  res.json(item);
});

export default router;
