import React, { useState } from 'react';
import { FilterSelect } from '../common/FilterSelect';
import { useApp } from '../../context/AppContext';
import { TechStatusBadge } from '../common/UIComponents';
import { 
  Users, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Sparkles,
  Phone,
  ShieldCheck
} from 'lucide-react';

export const TechniciansModule: React.FC = () => {
  const { technicians, selectedCityFilter, setSelectedCityFilter, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  const filteredTechs = technicians.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'TODOS' || t.status === selectedStatus;
    const matchesCity = selectedCityFilter === 'TODAS' || t.city.toLowerCase() === selectedCityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCity;
  });

  return (
    <div className="fluid-page fluid-plus space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Técnicos & Rotas
          </h1>
           <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Status em Tempo Real</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            {filteredTechs.length} Mecânicos Listados
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar técnico, polo, especialidade..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterSelect
            value={selectedStatus}
            onChange={(v) => setSelectedStatus(v)}
            options={[
              { value: "TODOS", label: "Status: Todos" },
              { value: "DISPONIVEL", label: "🟢 Disponível" },
              { value: "EM_DESLOCAMENTO", label: "🔵 Em Deslocamento" },
              { value: "EM_ATENDIMENTO", label: "🟡 Em Atendimento" },
              { value: "ATRASADO", label: "🔴 Atrasado / Desvio" }
            ]}
          />

          <FilterSelect
            value={selectedCityFilter}
            onChange={(v) => setSelectedCityFilter(v)}
            options={[
              { value: "TODAS", label: "Cidade: Todas" },
              { value: "Campinas", label: "Campinas (SP)" },
              { value: "São Paulo", label: "São Paulo (SP)" },
              { value: "São Bernardo do Campo", label: "São Bernardo do Campo (SP)" },
              { value: "Rio de Janeiro", label: "Rio de Janeiro (RJ)" }
            ]}
          />
        </div>
      </div>

      {/* Grid of Tech Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(320px, 21vw, 460px), 1fr))' }}>
        {filteredTechs.map((tech) => (
          <div
            key={tech.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {tech.avatar ? (
                  <img src={tech.avatar} alt={tech.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">
                    {tech.name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{tech.name}</h3>
                  <div className="text-xs text-slate-400">{tech.city} • Sup: {tech.supervisorName.split(' ')[0]}</div>
                  <div className="mt-1">
                    <TechStatusBadge status={tech.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* GPS & Address */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{tech.currentLocation?.address || `${tech.city || 'São Paulo'} - Em Rota`}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Frota: OTIS Mobile Tech</span>
                <span className="font-mono text-emerald-400">GPS Conectado</span>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">Especialidades Técnicas</div>
              <div className="flex flex-wrap gap-1">
                {(tech.specialties || []).map((spec, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-400 block">SLA</span>
                <span className="font-mono font-bold text-cyan-300">{tech.slaComplianceRate}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-400 block">TA Médio</span>
                <span className="font-mono font-bold text-slate-200">{tech.avgArrivalTimeMin} min</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-400 block">Chamados</span>
                <span className="font-mono font-bold text-slate-200">{tech.completedCallsMonth}/mês</span>
              </div>
            </div>

            {/* Direct Contact Button */}
            <button
              onClick={() => {
                addToast({
                  type: 'info',
                  title: 'Comunicação Operacional',
                  message: `Canal aberto com ${tech.name} via rádio digital / WhatsApp corporativo.`
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contatar Técnico</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};