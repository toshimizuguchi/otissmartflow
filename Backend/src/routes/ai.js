import { Router } from 'express';
import { store } from '../db.js';

const router = Router();

// POST /api/v1/ai/query
router.post('/query', (req, res) => {
  const { prompt } = req.body;
  const p = (prompt || '').toLowerCase();

  let text = 'O OTIS SmartFlow IA analisou a sua solicitação. Todos os sistemas de despacho, telemetria preditiva IoT e cumprimento de SLA estão operando dentro dos parâmetros de excelência técnica.';

  if (p.includes('emergencia') || p.includes('preso') || p.includes('passageiro')) {
    text = '⚠️ PROTOCOLO DE EMERGÊNCIA ATIVADO: Passageiro retido requer atendimento em até 45 minutos. O técnico mais próximo com rota otimizada foi alocado com prioridade máxima.';
  } else if (p.includes('sla') || p.includes('polo')) {
    text = '📊 Cumprimento de SLA consolidado nacional: 96.8%. Polo Campinas em 98.2%, Polo São Paulo Berrini em 95.4%. Tempo médio de atendimento: 28 minutos.';
  } else if (p.includes('peca') || p.includes('estoque')) {
    text = '🔧 Gestão de Peças Preditivas: Identificado consumo anômalo de operadores de porta AT120 na linha Gen2 Comfort. Recomendado reposição preventiva de 10 unidades.';
  }

  res.json({
    text,
    metrics: [
      { label: 'Disponibilidade Frota', value: '98.4%' },
      { label: 'SLA Geral', value: '96.8%' },
      { label: 'Tempo Médio Resposta', value: '28 min' }
    ],
    suggestedAction: {
      type: 'VIEW_DASHBOARD',
      label: 'Abrir Monitor em Tempo Real'
    }
  });
});

// POST /api/v1/ai/analyze-call
router.post('/analyze-call', (req, res) => {
  const { problemDescription, hasTrappedPassenger, isCarStopped } = req.body;

  const isEmergency = hasTrappedPassenger || (problemDescription && problemDescription.toLowerCase().includes('preso'));
  const priority = isEmergency ? 'EMERGENCIA' : isCarStopped ? 'ALTA' : 'NORMAL';

  // Seleciona um técnico disponível
  const availableTech = store.technicians.find(t => t.status === 'DISPONIVEL') || store.technicians[0];

  res.json({
    suggestedPriority: priority,
    suggestedTechnicianId: availableTech ? availableTech.id : 'TEC-001',
    suggestedTechnicianName: availableTech ? availableTech.name : 'Carlos Oliveira',
    confidence: isEmergency ? 0.98 : 0.89,
    estimatedTimeMin: isEmergency ? 25 : 45,
    matchReason: isEmergency
      ? 'Passageiro retido detectado. Despacho urgente para técnico especialista em segurança e portas.'
      : 'Roteirização por proximidade geográfica e menor tempo de deslocamento.',
    recommendedParts: ['Placa de Porta AT120', 'Sensor Magnético de Parada'],
    recommendedTools: ['Chave de Emergência OTIS', 'Multímetro Fluke Cat IV']
  });
});

export default router;
