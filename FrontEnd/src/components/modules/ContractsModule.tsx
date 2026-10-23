import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, DollarSign, AlertTriangle, CheckCircle, TrendingUp, Search, Building2 } from 'lucide-react';

export const ContractsModule: React.FC = () => {
  const { contracts, setActiveView, updateContractStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const q = (searchQuery || '').toLowerCase();
  const filteredContracts = contracts.filter(c =>
    (c.customerName || (c as any).clientName || '').toLowerCase().includes(q) ||
    (c.contractNumber || (c as any).code || '').toLowerCase().includes(q)
  );

  return (
    <div className="fluid-page fluid-plus space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Contratos & Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            DRE & Margens
          </p>
        </div>

        <button
          onClick={() => setActiveView('financial')}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
        >
          Ver Painel Financeiro Detalhado
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, número de contrato, cidade..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map((contract) => (
          <div key={contract.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">{contract.contractNumber || (contract as any).code || 'CTR-OTIS'}</span>
                <h3 className="text-sm font-bold text-slate-100">{contract.customerName || (contract as any).clientName || 'Cliente Corporativo'}</h3>
                <span className="text-xs text-slate-400">{contract.equipmentsCount || 1} elevadores sob gestão • SLA {contract.slaRequiredRate || (contract as any).slaTargetMin || 98}%</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${contract.status === 'EM_RISCO' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                {contract.status === 'EM_RISCO' ? 'Em Risco' : 'Saudável'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Receita Mensal:</span>
                <span className="font-mono font-bold text-slate-100">R$ {Number(contract.monthlyRevenue ?? (contract as any).monthlyValue ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Custo de Peças:</span>
                <span className="font-mono text-slate-200">- R$ {Number(contract.monthlyPartsCost ?? ((contract as any).costAccumulated ? (contract as any).costAccumulated * 0.4 : 0)).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Horas Técnicas:</span>
                <span className="font-mono text-slate-200">- R$ {Number(contract.monthlyTechLaborCost ?? ((contract as any).costAccumulated ? (contract as any).costAccumulated * 0.6 : 0)).toLocaleString('pt-BR')}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-slate-200">Margem Atual:</span>
                <span className={`font-mono ${(contract.currentMarginRate ?? (contract as any).marginPercent ?? 0) < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {contract.currentMarginRate ?? (contract as any).marginPercent ?? 70}% (Meta: {contract.baselineMarginRate || 25}%)
                </span>
              </div>
            </div>

            {contract.marginDropAlert && (
              <div className="pt-3 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{contract.marginDropAlert}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">Status Operacional:</span>
              <button
                type="button"
                onClick={() => updateContractStatus(contract.id, contract.status === 'EM_RISCO' ? 'ATIVO' : 'EM_RISCO')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {contract.status === 'EM_RISCO' ? 'Regularizar Status' : 'Sinalizar Risco'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};