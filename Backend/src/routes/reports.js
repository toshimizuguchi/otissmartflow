import { Router } from 'express';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { store } from '../db.js';

const router = Router();

const REPORT_CATALOG = [
  { id: 'executivo-nacional', title: 'Relatório Executivo Nacional (Presidência)', format: 'PDF' },
  { id: 'sla-polos', title: 'Relatório de Cumprimento de SLA por Polo', format: 'EXCEL' },
  { id: 'dossie-financeiro', title: 'Dossiê Financeiro & DRE de Contratos', format: 'EXCEL' },
  { id: 'inventario-preditivo', title: 'Inventário Preditivo & Padrões de Falha', format: 'EXCEL' },
  { id: 'auditoria-decisoes', title: 'Auditoria de Decisões: Supervisor vs IA', format: 'PDF' }
];

// GET /api/v1/reports/types
router.get('/types', (req, res) => {
  res.json(REPORT_CATALOG);
});

// GET /api/v1/reports/download/:reportType
router.get('/download/:reportType', (req, res) => {
  const { reportType } = req.params;
  const rep = REPORT_CATALOG.find(r => r.id === reportType) || REPORT_CATALOG[0];

  if (rep.format === 'PDF') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Cabeçalho OTIS
    doc.fontSize(22).fillColor('#002B49').text('OTIS SMARTFLOW IA', { align: 'center' });
    doc.fontSize(14).fillColor('#555555').text(rep.title, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(10).fillColor('#333333').text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`);
    doc.text(`Ambiente: Produção Nuvem (Node.js/Express)`);
    doc.text(`Total de Equipamentos Monitorados: ${store.equipments.length}`);
    doc.text(`Disponibilidade da Frota: 98.4% | SLA Cumprido: 96.8%`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#002B49').text('Resumo Operacional:', { underline: true });
    doc.moveDown(0.5);

    store.calls.forEach((c, idx) => {
      doc.fontSize(10).fillColor('#222222').text(
        `${idx + 1}. [${c.code}] ${c.clientName} - Prioridade: ${c.priority} - Status: ${c.status}`
      );
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#888888').text('Gerado automaticamente pelo motor OTIS SmartFlow Analytics.', { align: 'center' });

    doc.end();
  } else {
    // Formato EXCEL (.xlsx)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.xlsx"`);

    const wb = XLSX.utils.book_new();

    const dataRows = store.calls.map(c => ({
      'Código OS': c.code,
      'Cliente': c.clientName,
      'Equipamento ID': c.equipmentId,
      'Cidade': c.city || 'São Paulo',
      'Prioridade': c.priority,
      'Status': c.status,
      'Técnico': c.technicianName || 'Não atribuído',
      'Passageiro Preso': c.hasTrappedPassenger ? 'SIM' : 'NÃO',
      'Criado em': c.createdAt
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  }
});

export default router;
