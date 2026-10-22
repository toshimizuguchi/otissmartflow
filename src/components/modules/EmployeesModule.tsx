import React, { useState } from 'react';
import { FilterSelect } from '../common/FilterSelect';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole } from '../../types';
import { 
  Users, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Hourglass,
  Search, 
  Filter, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  FileText, 
  Download, 
  Sparkles, 
  Plus, 
  Info,
  Check,
  Building2,
  MapPin,
  AlertCircle,
  Wrench,
  Send,
  MessageSquare,
  Bell,
  Eye,
  X
} from 'lucide-react';

interface SupervisorActionState {
  isOpen: boolean;
  employee: Employee | null;
  type: 'BONUS' | 'HORA_EXTRA';
  action: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY';
  notes: string;
  supervisorMessage: string;
  notifySupervisorChecked: boolean;
}

export const EmployeesModule: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    timePunches, 
    approveBonus, 
    approveOvertime,
    setBonusPending,
    setOvertimePending,
    notifySupervisor,
    addToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [bonusFilter, setBonusFilter] = useState<string>('ALL');
  const [overtimeFilter, setOvertimeFilter] = useState<string>('ALL');
  
  // Selected employee for the complete details modal
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);

  // Modal for approval / rejection / supervisor notification
  const [actionModal, setActionModal] = useState<SupervisorActionState>({
    isOpen: false,
    employee: null,
    type: 'BONUS',
    action: 'APPROVE',
    notes: '',
    supervisorMessage: '',
    notifySupervisorChecked: true
  });

  // Calculate aggregates
  const totalEmployees = employees.length;
  const totalBaseSalary = employees.reduce((acc, e) => acc + (e.baseSalary || 0), 0);
  const totalBonusApproved = employees
    .filter(e => e.bonusStatus === 'APROVADO')
    .reduce((acc, e) => acc + (e.bonusAmount || 0), 0);
  const totalBonusPending = employees
    .filter(e => e.bonusStatus === 'PENDENTE' && e.isBonusEligible)
    .reduce((acc, e) => acc + (e.bonusSuggested || e.bonusAmount || 0), 0);
  const totalOvertimeHours = employees.reduce((acc, e) => acc + (e.overtimeHours || 0), 0);
  const totalOvertimeAmount = employees.reduce((acc, e) => acc + (e.overtimeTotalAmount || 0), 0);
  const totalPayrollCost = totalBaseSalary + totalBonusApproved + totalOvertimeAmount;

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const specialtyText = emp.specialty || '';
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialtyText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.unit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

    let matchesBonus = true;
    if (bonusFilter === 'ELIGIBLE') matchesBonus = emp.isBonusEligible;
    if (bonusFilter === 'NOT_ELIGIBLE') matchesBonus = !emp.isBonusEligible;
    if (bonusFilter === 'PENDING') matchesBonus = emp.bonusStatus === 'PENDENTE';
    if (bonusFilter === 'APPROVED') matchesBonus = emp.bonusStatus === 'APROVADO';
    if (bonusFilter === 'REJECTED') matchesBonus = emp.bonusStatus === 'REPROVADO';

    let matchesOvertime = true;
    if (overtimeFilter === 'HAS_OVERTIME') matchesOvertime = (emp.overtimeHours || 0) > 0;
    if (overtimeFilter === 'PENDING') matchesOvertime = emp.overtimeStatus === 'PENDENTE';
    if (overtimeFilter === 'APPROVED') matchesOvertime = emp.overtimeStatus === 'APROVADO';
    if (overtimeFilter === 'REJECTED') matchesOvertime = emp.overtimeStatus === 'REPROVADO';

    return matchesSearch && matchesRole && matchesBonus && matchesOvertime;
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Open modal for Bonus action
  const handleOpenBonusAction = (employee: Employee, actionType: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY') => {
    const supName = employee.supervisorName || 'Supervisor Responsável';
    let defaultNotes = '';
    let defaultSupMessage = '';

    if (actionType === 'APPROVE') {
      defaultNotes = `Bônus homologado por ${currentUser.name} (${currentUser.role}). Meta de produtividade e assiduidade cumpridas.`;
    } else {
      defaultNotes = `Bônus não aprovado após auditoria de métricas de fechamento.`;
      defaultSupMessage = `Prezado(a) ${supName}, informamos que o bônus de ${employee.name} (${formatCurrency(employee.bonusSuggested || employee.bonusAmount)}) não foi aprovado pelo Financeiro devido a inconformidades no fechamento de metas/assiduidade. Favor revisar.`;
    }

    setActionModal({
      isOpen: true,
      employee,
      type: 'BONUS',
      action: actionType,
      notes: defaultNotes,
      supervisorMessage: defaultSupMessage,
      notifySupervisorChecked: actionType === 'REJECT_AND_NOTIFY' || actionType === 'REJECT'
    });
  };

  // Open modal for Overtime action
  const handleOpenOvertimeAction = (employee: Employee, actionType: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY') => {
    const supName = employee.supervisorName || 'Supervisor Responsável';
    let defaultNotes = '';
    let defaultSupMessage = '';

    if (actionType === 'APPROVE') {
      defaultNotes = `Horas extras (${employee.overtimeHours}h - ${formatCurrency(employee.overtimeTotalAmount)}) homologadas para pagamento na folha.`;
    } else {
      defaultNotes = `Horas extras (${employee.overtimeHours}h) não aprovadas na auditoria de apontamento.`;
      defaultSupMessage = `Prezado(a) ${supName}, as horas extras de ${employee.name} (${employee.overtimeHours}h - ${formatCurrency(employee.overtimeTotalAmount)}) foram recusadas pelo setor Financeiro por falta de OS comprobatória ou divergência de apontamento. Solicitamos justificativa formal.`;
    }

    setActionModal({
      isOpen: true,
      employee,
      type: 'HORA_EXTRA',
      action: actionType,
      notes: defaultNotes,
      supervisorMessage: defaultSupMessage,
      notifySupervisorChecked: actionType === 'REJECT_AND_NOTIFY' || actionType === 'REJECT'
    });
  };

  // Confirm action in modal
  const handleConfirmActionModal = () => {
    if (!actionModal.employee) return;
    const emp = actionModal.employee;
    const isApprove = actionModal.action === 'APPROVE';
    const shouldNotify = !isApprove && actionModal.notifySupervisorChecked && !!actionModal.supervisorMessage.trim();

    if (actionModal.type === 'BONUS') {
      approveBonus(
        emp.id, 
        isApprove, 
        actionModal.notes, 
        shouldNotify, 
        shouldNotify ? actionModal.supervisorMessage : undefined
      );
    } else {
      approveOvertime(
        emp.id, 
        isApprove, 
        actionModal.notes, 
        shouldNotify, 
        shouldNotify ? actionModal.supervisorMessage : undefined
      );
    }

    setActionModal(prev => ({ ...prev, isOpen: false, employee: null }));
  };

  // Quick direct approve bonus
  const handleQuickApproveBonus = (emp: Employee) => {
    approveBonus(emp.id, true, `Bônus homologado por ${currentUser.name} (${currentUser.role}).`);
  };

  // Quick direct approve overtime
  const handleQuickApproveOvertime = (emp: Employee) => {
    approveOvertime(emp.id, true, `Horas extras homologadas por ${currentUser.name} (${currentUser.role}).`);
  };

  // Batch approve all eligible bonus
  const handleApproveAllEligibleBonus = () => {
    const eligiblePending = employees.filter(e => e.isBonusEligible && e.bonusStatus === 'PENDENTE');
    if (eligiblePending.length === 0) {
      addToast({
        type: 'info',
        title: 'Sem Bônus Pendentes',
        message: 'Todos os colaboradores elegíveis já foram aprovados ou processados.'
      });
      return;
    }

    eligiblePending.forEach(emp => {
      approveBonus(emp.id, true, `Aprovação em lote homologada por ${currentUser.name} (${currentUser.role}).`);
    });

    addToast({
      type: 'success',
      title: 'Aprovação em Lote Concluída',
      message: `${eligiblePending.length} bônus foram aprovados com sucesso.`
    });
  };

  return (
    <div className="fluid-page fluid-plus space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Quadro de Funcionários & Fechamento de Folha
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Visualização simplificada para o Financeiro: Nome, Especialidade, Salário Base, Bônus e Horas Extras. Detalhes completos via espelho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(currentUser.role === 'FINANCEIRO' || currentUser.role === 'PRESIDENTE' || currentUser.role === 'GERENTE' || currentUser.role === 'ADMINISTRADOR') && (
            <button
              onClick={handleApproveAllEligibleBonus}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Aprova todos os bônus que cumpriram 100% dos requisitos"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Aprovar Todos Elegíveis</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Colaboradores</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {totalEmployees}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Equipe Ativa em Folha
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Salário Base Total</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalBaseSalary)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Folha Fixa Mensal
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Bônus Aprovados</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalBonusApproved)}
          </div>
          <p className="text-[11px] text-amber-300 mt-1">
            {formatCurrency(totalBonusPending)} pendente de homologação
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Horas Extras</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {totalOvertimeHours.toFixed(1)}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatCurrency(totalOvertimeAmount)} acumulados
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Custo Total da Folha</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalPayrollCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Salário + Bônus + H.E.
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, especialidade, polo ou cidade..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Cargo filter */}
            <FilterSelect
              value={roleFilter}
              onChange={(v) => setRoleFilter(v)}
              options={[
                { value: "ALL", label: "Todos os Cargos" },
                { value: "TECNICO", label: "Técnicos de Campo" },
                { value: "ATENDENTE", label: "Atendentes 24/7" },
                { value: "SUPERVISOR", label: "Supervisores" },
                { value: "GERENTE", label: "Gerentes" },
                { value: "FINANCEIRO", label: "Financeiro & Controladoria" }
              ]}
            />

            {/* Bonus filter */}
            <FilterSelect
              value={bonusFilter}
              onChange={(v) => setBonusFilter(v)}
              options={[
                { value: "ALL", label: "Filtro de Bônus" },
                { value: "PENDING", label: "Bônus Pendentes" },
                { value: "APPROVED", label: "Bônus Aprovados" },
                { value: "REJECTED", label: "Bônus Reprovados" },
                { value: "ELIGIBLE", label: "Elegíveis pela IA" },
                { value: "NOT_ELIGIBLE", label: "Não Elegíveis" }
              ]}
            />

            {/* Overtime filter */}
            <FilterSelect
              value={overtimeFilter}
              onChange={(v) => setOvertimeFilter(v)}
              options={[
                { value: "ALL", label: "Filtro de Horas Extras" },
                { value: "HAS_OVERTIME", label: "Com Horas Extras" },
                { value: "PENDING", label: "H.E. Pendentes" },
                { value: "APPROVED", label: "H.E. Aprovadas" },
                { value: "REJECTED", label: "H.E. Não Aprovadas" }
              ]}
            />

          </div>
        </div>
      </div>

      {/* Clean Employee List for Financial view: Nome, Especialidade, Salário, Bônus, Hora Extra */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhum funcionário encontrado com os filtros selecionados.</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar a busca ou os seletores de filtro.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const overtimeStatus = emp.overtimeStatus || 'PENDENTE';
            const bonusStatus = emp.bonusStatus || 'PENDENTE';
            const specialty = emp.specialty || emp.roleTitle;

            return (
              <div 
                key={emp.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm space-y-3.5 overflow-hidden"
              >
                {/* 1. Header do Card: Identificação do Colaborador, Salário Base e Botão "Mais Detalhes" */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                  {/* Identificação */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {emp.avatar ? (
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-slate-700 object-cover shrink-0 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                        {emp.name.substring(0, 2)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate" title={emp.name}>
                          {emp.name}
                        </h3>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                          emp.currentPunchStatus === 'EM_JORNADA'
                            ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                            : emp.currentPunchStatus === 'EM_INTERVALO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-white border border-slate-700'
                        }`}>
                          {emp.currentPunchStatus === 'EM_JORNADA' ? 'Jornada' : emp.currentPunchStatus === 'EM_INTERVALO' ? '☕ Intervalo' : 'Fora'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 shrink-0">
                          {emp.roleTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="text-slate-300">{emp.unit}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[280px]" title={specialty}>{specialty}</span>
                        </span>
                        {emp.supervisorName && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>Supervisor: <strong className="text-cyan-300 font-medium">{emp.supervisorName}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações do Topo: Salário Base & Botão "Mais Detalhes" */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-800/50">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left sm:text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Salário Base</span>
                      <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                        {formatCurrency(emp.baseSalary)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedEmployeeForDetails(emp)}
                      className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 active:scale-[0.98] border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group shadow-sm shrink-0"
                      title="Ver espelho completo com tarefas, urgências, faltas, atrasos e histórico de ponto"
                    >
                      <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Mais Detalhes</span>
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* 2. Grid de Controles de Folha: Bônus & Horas Extras com Aprovação / Rejeição / Notificação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  
                  {/* Bônus */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bônus Mensal</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          bonusStatus === 'APROVADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : bonusStatus === 'REPROVADO'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {bonusStatus === 'APROVADO' ? '✓ Aprovado' : bonusStatus === 'REPROVADO' ? '✕ Não Aprovado' : '⏳ Pendente'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                        {formatCurrency(emp.bonusSuggested || emp.bonusAmount || 0)}
                      </div>
                    </div>

                    {/* Botões de Ação para Bônus */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleQuickApproveBonus(emp)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bonusStatus === 'APROVADO'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                            : '!bg-transparent text-emerald-300/40 hover:text-emerald-300 border-slate-700 hover:border-emerald-300/40'
                        }`}
                        title="Aprovar Bônus"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setBonusPending(emp.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bonusStatus === 'PENDENTE'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-300/40'
                            : '!bg-transparent text-amber-300/40 hover:text-amber-300 border-slate-700 hover:border-amber-300/40'
                        }`}
                        title="Marcar Bônus como Pendente"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenBonusAction(emp, 'REJECT')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bonusStatus === 'REPROVADO'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-300/40'
                            : '!bg-transparent text-rose-300/40 hover:text-rose-300 border-slate-700 hover:border-rose-300/40'
                        }`}
                        title="Não Aprovar Bônus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenBonusAction(emp, 'REJECT_AND_NOTIFY')}
                        className="px-2 py-1.5 rounded-lg !bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Não Aprovar e Notificar Supervisor"
                      >
                        <Send className="w-3 h-3" />
                        <span>Notificar</span>
                      </button>
                    </div>
                  </div>

                  {/* Horas Extras */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Horas Extras</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          overtimeStatus === 'APROVADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : overtimeStatus === 'REPROVADO'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {overtimeStatus === 'APROVADO' ? '✓ Aprovada' : overtimeStatus === 'REPROVADO' ? '✕ Não Aprovada' : '⏳ Pendente'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                        {emp.overtimeHours.toFixed(1)}h{' '}
                        <span className="text-xs text-slate-400 font-normal font-mono">
                          ({formatCurrency(emp.overtimeTotalAmount)})
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação para Horas Extras */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleQuickApproveOvertime(emp)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          overtimeStatus === 'APROVADO'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                            : '!bg-transparent text-emerald-300/40 hover:text-emerald-300 border-slate-700 hover:border-emerald-300/40'
                        }`}
                        title="Aprovar Horas Extras"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setOvertimePending(emp.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          overtimeStatus === 'PENDENTE'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-300/40'
                            : '!bg-transparent text-amber-300/40 hover:text-amber-300 border-slate-700 hover:border-amber-300/40'
                        }`}
                        title="Marcar Horas Extras como Pendentes"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenOvertimeAction(emp, 'REJECT')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          overtimeStatus === 'REPROVADO'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-300/40'
                            : '!bg-transparent text-rose-300/40 hover:text-rose-300 border-slate-700 hover:border-rose-300/40'
                        }`}
                        title="Não Aprovar Horas Extras"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenOvertimeAction(emp, 'REJECT_AND_NOTIFY')}
                        className="px-2 py-1.5 rounded-lg !bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Não Aprovar e Notificar Supervisor"
                      >
                        <Send className="w-3 h-3" />
                        <span>Notificar</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal: "Mais Detalhes" (Tarefas, Urgências, Faltas, Atrasos, Ponto, Elegibilidade) */}
      {selectedEmployeeForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {selectedEmployeeForDetails.avatar ? (
                  <img 
                    src={selectedEmployeeForDetails.avatar} 
                    alt={selectedEmployeeForDetails.name} 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-slate-700 object-cover shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {selectedEmployeeForDetails.name.substring(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">
                      {selectedEmployeeForDetails.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {selectedEmployeeForDetails.specialty || selectedEmployeeForDetails.roleTitle} • <span className="text-slate-300">{selectedEmployeeForDetails.unit} ({selectedEmployeeForDetails.city})</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployeeForDetails(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1 text-xs">
              
              {/* Resumo Financeiro no Topo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Salário Base</span>
                  <strong className="block mt-1 text-lg sm:text-xl text-white font-mono">{formatCurrency(selectedEmployeeForDetails.baseSalary)}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bônus Mensal</span>
                  <strong className="block mt-1 text-lg sm:text-xl text-emerald-300 font-mono">
                    {formatCurrency(selectedEmployeeForDetails.bonusAmount || selectedEmployeeForDetails.bonusSuggested || 0)}
                  </strong>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                    selectedEmployeeForDetails.bonusStatus === 'APROVADO'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                      : selectedEmployeeForDetails.bonusStatus === 'REPROVADO'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-300/40'
                      : 'bg-amber-500/10 text-amber-300 border-amber-300/40'
                  }`}>
                    {selectedEmployeeForDetails.bonusStatus === 'APROVADO' ? 'Aprovado' : selectedEmployeeForDetails.bonusStatus === 'REPROVADO' ? 'Não aprovado' : 'Pendente'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Horas Extras</span>
                  <strong className="block mt-1 text-lg sm:text-xl text-purple-300 font-mono">
                    {selectedEmployeeForDetails.overtimeHours.toFixed(1)}h
                  </strong>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                    {formatCurrency(selectedEmployeeForDetails.overtimeTotalAmount)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pontualidade</span>
                  <strong className="block mt-1 text-lg sm:text-xl text-cyan-300 font-mono">{selectedEmployeeForDetails.punctualityRate}%</strong>
                </div>
              </div>

              {/* Seção 1: Tarefas & Urgências */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Tarefas e metas */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Tarefas e metas
                    </span>
                    <span className="font-mono font-bold text-sm text-cyan-300">
                      {Math.round((selectedEmployeeForDetails.tasksCompleted / (selectedEmployeeForDetails.tasksTarget || 30)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-2.5">
                    <div 
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${Math.min(100, Math.round((selectedEmployeeForDetails.tasksCompleted / (selectedEmployeeForDetails.tasksTarget || 30)) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedEmployeeForDetails.tasksCompleted} de {selectedEmployeeForDetails.tasksTarget || 30} tarefas concluídas
                  </p>
                </div>

                {/* Urgências e SLA */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Urgências e SLA
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {selectedEmployeeForDetails.slaComplianceRate}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3.5">
                    {selectedEmployeeForDetails.urgentCallsHandled} atendidas · {selectedEmployeeForDetails.urgentCallsSlaMet} dentro do SLA
                  </p>
                </div>

              </div>

              {/* Seção 2: Assiduidade */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Assiduidade
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      selectedEmployeeForDetails.absencesCount === 0
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                        : 'bg-rose-500/10 text-rose-300 border-rose-300/40'
                    }`}>
                      {selectedEmployeeForDetails.absencesCount === 0 ? '0 faltas' : `${selectedEmployeeForDetails.absencesCount} falta(s)`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      selectedEmployeeForDetails.lateTotalMinutes === 0
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                        : 'bg-amber-500/10 text-amber-300 border-amber-300/40'
                    }`}>
                      {selectedEmployeeForDetails.lateTotalMinutes === 0 ? '0 min de atraso' : `${selectedEmployeeForDetails.lateTotalMinutes} min de atraso`}
                    </span>
                  </div>
                </div>

                {selectedEmployeeForDetails.absenceDetails && selectedEmployeeForDetails.absenceDetails.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200 space-y-1">
                    <p className="font-semibold text-[11px] text-rose-300">Detalhamento das Ausências:</p>
                    {selectedEmployeeForDetails.absenceDetails.map((abs, idx) => (
                      <p key={idx} className="text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{abs}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção 3: Critérios de capacitação / elegibilidade ao bônus */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Critérios de capacitação / elegibilidade ao bônus
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    selectedEmployeeForDetails.isBonusEligible
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-300/40'
                      : 'bg-rose-500/10 text-rose-300 border-rose-300/40'
                  }`}>
                    {selectedEmployeeForDetails.isBonusEligible ? 'Capacitado pela IA' : 'Não elegível'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {selectedEmployeeForDetails.bonusEligibilityReason}
                </p>

                {selectedEmployeeForDetails.bonusNotes && (
                  <p className="text-[11px] text-slate-400">
                    Parecer do financeiro: <span className="text-slate-300">{selectedEmployeeForDetails.bonusNotes}</span>
                  </p>
                )}
              </div>

              {/* Seção 4: Registros de ponto */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Registros de ponto
                </h4>

                {selectedEmployeeForDetails.recentPunches && selectedEmployeeForDetails.recentPunches.length > 0 ? (
                  <div>
                    {selectedEmployeeForDetails.recentPunches.map((punch) => (
                      <div 
                        key={punch.id}
                        className="py-2 border-t border-slate-800 first:border-t-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-white font-mono text-xs">{punch.formattedTime}</strong>
                            <span className="text-slate-400">({punch.formattedDate})</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-white border border-white/35">
                              {punch.type.replace('_', ' ')}
                            </span>
                            {punch.isLate && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-300/40">
                                Atraso: {punch.lateMinutes} min
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {punch.location}
                          </p>
                        </div>

                        {punch.notes && (
                          <span className="text-[11px] text-slate-400 italic sm:max-w-[220px] text-left sm:text-right truncate shrink-0">
                            {punch.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic py-2">
                    Nenhuma batida de ponto adicional registrada no período.
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Supervisor: <strong className="text-cyan-300">{selectedEmployeeForDetails.supervisorName || 'Roberto Viana'}</strong>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    handleOpenBonusAction(selectedEmployeeForDetails, 'REJECT_AND_NOTIFY');
                  }}
                  className="px-3.5 py-2 rounded-xl !bg-transparent hover:border-slate-500 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notificar supervisor</span>
                </button>

                <button
                  onClick={() => setSelectedEmployeeForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal for Approval / Rejection and Notifying Supervisor */}
      {actionModal.isOpen && actionModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                actionModal.action === 'APPROVE' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {actionModal.action === 'APPROVE' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionModal.action === 'APPROVE' 
                    ? `Aprovar ${actionModal.type === 'BONUS' ? 'Bônus' : 'Horas Extras'}`
                    : `Não Aprovar & Notificar Supervisor`
                  }
                </h3>
                <p className="text-xs text-slate-400">
                  Colaborador: <strong className="text-slate-200">{actionModal.employee.name}</strong> • {actionModal.type === 'BONUS' ? formatCurrency(actionModal.employee.bonusSuggested || actionModal.employee.bonusAmount) : `${actionModal.employee.overtimeHours}h (${formatCurrency(actionModal.employee.overtimeTotalAmount)})`}
                </p>
              </div>
            </div>

            {/* Parecer do Financeiro */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Parecer / Observação da Controladoria Financeira:
              </label>
              <textarea
                value={actionModal.notes}
                onChange={(e) => setActionModal(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Insira a justificativa financeira..."
              />
            </div>

            {/* Seção de Notificação ao Supervisor */}
            {actionModal.action !== 'APPROVE' && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actionModal.notifySupervisorChecked}
                      onChange={(e) => setActionModal(prev => ({ ...prev, notifySupervisorChecked: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                      Notificar Supervisor Imediatamente
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    Destinatário: <strong className="text-cyan-300">{actionModal.employee.supervisorName || 'Roberto Viana'}</strong>
                  </span>
                </div>

                {actionModal.notifySupervisorChecked && (
                  <div>
                    <span className="text-[11px] text-amber-200 block mb-1">
                      Mensagem oficial a ser enviada ao supervisor:
                    </span>
                    <textarea
                      value={actionModal.supervisorMessage}
                      onChange={(e) => setActionModal(prev => ({ ...prev, supervisorMessage: e.target.value }))}
                      rows={3}
                      className="w-full p-2.5 bg-slate-950 border border-amber-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="Descreva a contestação ou motivo para alinhamento com o supervisor..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(prev => ({ ...prev, isOpen: false, employee: null }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmActionModal}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                  actionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                }`}
              >
                {actionModal.action === 'APPROVE' 
                  ? 'Confirmar Aprovação' 
                  : actionModal.notifySupervisorChecked 
                  ? 'Não Aprovar & Notificar' 
                  : 'Confirmar Não Aprovação'
                }
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};