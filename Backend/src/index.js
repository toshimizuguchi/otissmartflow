import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import equipmentsRoutes from './routes/equipments.js';
import techniciansRoutes from './routes/technicians.js';
import callsRoutes from './routes/calls.js';
import contractsRoutes from './routes/contracts.js';
import partsRoutes from './routes/parts.js';
import employeesRoutes from './routes/employees.js';
import campaignsRoutes from './routes/campaigns.js';
import alertsRoutes from './routes/alerts.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rota raiz amigável (nunca mais tela em branco ou 404!)
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'OTIS SmartFlow IA - Core API Engine',
    runtime: 'Node.js & Express',
    version: '2.0.0',
    endpoints: {
      equipments: '/api/v1/equipments',
      technicians: '/api/v1/technicians',
      calls: '/api/v1/calls',
      contracts: '/api/v1/contracts',
      parts: '/api/v1/parts',
      employees: '/api/v1/employees',
      campaigns: '/api/v1/campaigns',
      alerts: '/api/v1/alerts',
      dashboard: '/api/v1/dashboard/metrics',
      ai: '/api/v1/ai',
      reports: '/api/v1/reports'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Montagem das rotas da API v1
app.use('/api/v1/equipments', equipmentsRoutes);
app.use('/api/v1/technicians', techniciansRoutes);
app.use('/api/v1/calls', callsRoutes);
app.use('/api/v1/contracts', contractsRoutes);
app.use('/api/v1/parts', partsRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/campaigns', campaignsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Rota de compatibilidade para relatórios (/reports)
app.use('/reports', reportsRoutes);

// Inicializa banco de dados e escuta na porta
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 [OTIS SmartFlow] API Node.js rodando com sucesso na porta ${PORT}`);
  });
});
