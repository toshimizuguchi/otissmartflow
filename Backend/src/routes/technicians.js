import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

const formatTech = (t) => ({
  ...t,
  assignedVehicle: t.assignedVehicle || 'Fiorino SmartFlow #10 (Placa OTIS-2026)',
  city: t.city || 'São Paulo',
  name: t.name || 'Técnico OTIS',
  currentLocation: t.currentLocation || {
    lat: t.currentLatitude || -23.5505,
    lng: t.currentLongitude || -46.6333,
    address: t.region || 'São Paulo - SP'
  }
});

// GET /api/v1/technicians
router.get('/', (req, res) => {
  const { city, status } = req.query;
  let list = store.technicians.map(formatTech);

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
  res.json(formatTech(item));
});

export default router;
