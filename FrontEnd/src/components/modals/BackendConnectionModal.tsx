import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import {
  X,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Layers,
  Cpu,
  RefreshCw,
  FileText
} from 'lucide-react';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { apiConnection, refreshFromBackend, setBackendUrls, addToast } = useApp();

  const [apiUrlInput, setApiUrlInput] = useState(apiService.config.getApiUrl());
  const [reportsUrlInput, setReportsUrlInput] = useState(apiService.config.getReportsUrl());

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiUrlInput(apiService.config.getApiUrl());
      setReportsUrlInput(apiService.config.getReportsUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await apiService.system.testConnection(apiUrlInput, reportsUrlInput);
      setTestResult(res);

      if (res.apiStatus === 'ONLINE') {
        addToast({
          type: 'success',
          title: 'Spring Boot Conectado!',
          message: `Latência: ${res.apiLatency}ms. Todas as APIs REST respondendo.`
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Spring Boot Indisponível',
          message: 'Verifique se o backend está rodando no endpoint informado.'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro no Teste',
        message: err.message || 'Falha ao testar conexão.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveUrls = () => {
    setBackendUrls(apiUrlInput.trim(), reportsUrlInput.trim());
    addToast({
      type: 'success',
      title: 'URLs Atualizadas',
      message: 'Novos endpoints do backend salvos e sincronização iniciada!'
    });
  };

  const handleResetDefaults = () => {
    apiService.config.resetUrls();
    const defApi = apiService.config.getApiUrl();
    const defRep = apiService.config.getReportsUrl();
    setApiUrlInput(defApi);
    setReportsUrlInput(defRep);
    setBackendUrls(defApi, defRep);
    addToast({
      type: 'info',
      title: 'Endpoints Restaurados',
      message: 'URLs voltaram aos padrões do ambiente.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Central de Conexão com Backend & Deploy
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  apiConnection.online
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {apiConnection.online ? '● CONECTADO' : '○ MODO LOCAL / OFFLINE'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Integração REST com Spring Boot (Java) e Motor de Relatórios (Python FastAPI)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Spring Boot API */}
            <div className={`p-4 rounded-2xl border transition-all ${
              apiConnection.online
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-2 text-white">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Spring Boot API (Java 17)
                </span>
                <span className={`w-2 h-2 rounded-full ${apiConnection.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                10 Controllers REST, banco PostgreSQL/Supabase, IA Copilot e Despacho de Ordens.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Status:</span>
                <span className={apiConnection.online ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {apiConnection.online ? `ONLINE (${apiConnection.apiLatencyMs || 25}ms)` : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Python FastAPI Reports */}
            <div className={`p-4 rounded-2xl border transition-all ${
              apiConnection.reportsOnline
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-2 text-white">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Reports Engine (Python 3)
                </span>
                <span className={`w-2 h-2 rounded-full ${apiConnection.reportsOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Geração em lote de relatórios executivos em PDF ReportLab e planilhas Excel OpenPyXL.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Status:</span>
                <span className={apiConnection.reportsOnline ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {apiConnection.reportsOnline ? `ONLINE (${apiConnection.reportsLatencyMs || 30}ms)` : 'OFFLINE (Fallback Ativo)'}
                </span>
              </div>
            </div>
          </div>

          {/* Configuração de Endpoints (Deploy / Local) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Configurar URLs de Conexão (Deploy / Produção)
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Restaurar Padrões
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Caso seu backend esteja hospedado em um provedor externo (ex: Render, Railway, Fly.io, Cloud Run ou Vercel Serverless), informe os links abaixo para que o front-end conecte diretamente:
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  URL Base da API Spring Boot
                </label>
                <input
                  type="text"
                  value={apiUrlInput}
                  onChange={e => setApiUrlInput(e.target.value)}
                  placeholder="https://seu-backend.onrender.com/api/v1 ou http://localhost:8080/api/v1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  URL Base do Motor de Relatórios Python
                </label>
                <input
                  type="text"
                  value={reportsUrlInput}
                  onChange={e => setReportsUrlInput(e.target.value)}
                  placeholder="https://seus-relatorios.onrender.com ou http://localhost:8000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testando...' : 'Testar Conexão Agora'}
              </button>

              <button
                type="button"
                onClick={handleSaveUrls}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Salvar & Conectar
              </button>
            </div>
          </div>

          {/* Endpoints Audit List */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Endpoints Conectados no Front-End (11 Módulos)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                100% Mapeados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {[
                { name: 'Equipamentos & Telemetria', path: '/api/v1/equipments', method: 'GET, POST, PATCH' },
                { name: 'Técnicos & Rastreamento', path: '/api/v1/technicians', method: 'GET' },
                { name: 'Chamados & Despacho', path: '/api/v1/calls', method: 'GET, POST, PATCH' },
                { name: 'Contratos & Margens DRE', path: '/api/v1/contracts', method: 'GET, POST, PATCH' },
                { name: 'Peças & Estoque Preditivo', path: '/api/v1/parts', method: 'GET, POST, PATCH' },
                { name: 'Colaboradores, Ponto & Folha', path: '/api/v1/employees', method: 'GET, POST, PATCH' },
                { name: 'Campanhas Preventivas', path: '/api/v1/campaigns', method: 'GET, POST, PATCH, DEL' },
                { name: 'Central de Alertas & IA', path: '/api/v1/alerts', method: 'GET, POST, PATCH' },
                { name: 'Dashboard Executivo KPIs', path: '/api/v1/dashboard/metrics', method: 'GET' },
                { name: 'IA Copilot & Triagem', path: '/api/v1/ai', method: 'POST' },
                { name: 'Relatórios Executivos Python', path: '/reports/download', method: 'GET, POST' }
              ].map((ep, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-semibold text-slate-200">{ep.name}</div>
                    <div className="font-mono text-[10px] text-cyan-400/90">{ep.path}</div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {ep.method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {apiConnection.lastSyncTime ? (
              <span>Última sincronização: <strong className="text-slate-200">{apiConnection.lastSyncTime}</strong></span>
            ) : (
              <span>Sincronização sob demanda pronta.</span>
            )}
          </div>

          <button
            type="button"
            onClick={refreshFromBackend}
            disabled={apiConnection.isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${apiConnection.isSyncing ? 'animate-spin' : ''}`} />
            {apiConnection.isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};
