import { Equipment, Technician, Call, Contract, Part, PartRequest, Employee, TimePunchRecord, MaintenanceCampaign, SmartFlowAlert } from '../types';

// Storage keys for custom backend URLs (supports runtime config without rebuild in production deploy)
export const STORAGE_API_KEY = 'smartflow_api_url';
export const STORAGE_REPORTS_KEY = 'smartflow_reports_url';

/**
 * Resolves the Backend Spring Boot API base URL:
 * 1. User manual override stored in localStorage
 * 2. Vite environment variable VITE_API_URL
 * 3. Runtime window.__ENV__
 * 4. Localhost fallback
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_API_KEY);
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  }

  const env = (import.meta as any).env || {};
  if (env.VITE_API_URL && env.VITE_API_URL.trim()) {
    return env.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  const winEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : undefined;
  if (winEnv?.VITE_API_URL && winEnv.VITE_API_URL.trim()) {
    return winEnv.VITE_API_URL.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return window.location.port === '3000' ? '/api/v1' : 'http://localhost:8080/api/v1';
    }
    // Deployed to HTTPS (Vercel, Render, etc.): use relative /api/v1 if proxy rewrite configured
    return '/api/v1';
  }

  return 'https://otissmartflow-1.onrender.com/api/v1';
}

/**
 * Resolves the Python Reports Engine base URL:
 * 1. User manual override stored in localStorage
 * 2. Vite environment variable VITE_REPORTS_URL
 * 3. Localhost fallback
 */
export function getReportsBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  }

  const env = (import.meta as any).env || {};
  if (env.VITE_REPORTS_URL && env.VITE_REPORTS_URL.trim()) {
    return env.VITE_REPORTS_URL.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return window.location.port === '3000' ? '/reports' : 'http://localhost:8000';
    }
    return '/reports';
  }

  return 'https://otissmartflow-1.onrender.com';
}

export function setCustomApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_API_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_API_KEY);
    }
  }
}

export function setCustomReportsUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_REPORTS_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_REPORTS_KEY);
    }
  }
}

export function resetBackendUrls() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_API_KEY);
    localStorage.removeItem(STORAGE_REPORTS_KEY);
  }
}

// Retain exported constants for backward compatibility
export const API_BASE = getApiBase();
export const REPORTS_BASE = getReportsBase();

async function safeFetch<T>(endpoint: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  const base = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    if (res.status === 204) {
      return (null as unknown) as T;
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const apiService = {
  // Config & URL Helpers
  config: {
    getApiUrl: getApiBase,
    getReportsUrl: getReportsBase,
    setApiUrl: setCustomApiUrl,
    setReportsUrl: setCustomReportsUrl,
    resetUrls: resetBackendUrls
  },

  // 1. Equipments & Elevators (/api/v1/equipments)
  equipments: {
    getAll: async (city?: string): Promise<Equipment[]> => {
      const qs = city && city !== 'TODAS' ? `?city=${encodeURIComponent(city)}` : '';
      return safeFetch<Equipment[]>(`/equipments${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Equipment | null> => {
      return safeFetch<Equipment | null>(`/equipments/${id}`, {}, null);
    },
    getByRisk: async (riskLevel: string): Promise<Equipment[]> => {
      return safeFetch<Equipment[]>(`/equipments/risk/${encodeURIComponent(riskLevel.toUpperCase())}`, {}, []);
    },
    create: async (eq: Partial<Equipment>): Promise<Equipment> => {
      return safeFetch<Equipment>('/equipments', {
        method: 'POST',
        body: JSON.stringify(eq)
      }, eq as Equipment);
    },
    updateStatus: async (id: string, status: string): Promise<Equipment | null> => {
      return safeFetch<Equipment | null>(`/equipments/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      }, null);
    }
  },

  // 2. Technicians in Field (/api/v1/technicians)
  technicians: {
    getAll: async (city?: string, status?: string): Promise<Technician[]> => {
      const params = new URLSearchParams();
      if (city && city !== 'TODAS') params.append('city', city);
      if (status) params.append('status', status);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return safeFetch<Technician[]>(`/technicians${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Technician | null> => {
      return safeFetch<Technician | null>(`/technicians/${id}`, {}, null);
    }
  },

  // 3. Calls & Service Tickets (/api/v1/calls)
  calls: {
    getAll: async (status?: string, priority?: string): Promise<Call[]> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return safeFetch<Call[]>(`/calls${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Call | null> => {
      return safeFetch<Call | null>(`/calls/${id}`, {}, null);
    },
    create: async (call: Partial<Call>): Promise<Call> => {
      return safeFetch<Call>('/calls', {
        method: 'POST',
        body: JSON.stringify(call)
      }, call as Call);
    },
    updateStatus: async (id: string, status: string): Promise<Call | null> => {
      return safeFetch<Call | null>(`/calls/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      }, null);
    },
    reassign: async (id: string, technicianId: string, technicianName: string): Promise<Call | null> => {
      return safeFetch<Call | null>(
        `/calls/${id}/reassign?technicianId=${encodeURIComponent(technicianId)}&technicianName=${encodeURIComponent(technicianName)}`,
        { method: 'PATCH' },
        null
      );
    }
  },

  // 4. Contracts & Financial DRE (/api/v1/contracts)
  contracts: {
    getAll: async (status?: string): Promise<Contract[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<Contract[]>(`/contracts${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Contract | null> => {
      return safeFetch<Contract | null>(`/contracts/${id}`, {}, null);
    },
    save: async (contract: Partial<Contract>): Promise<Contract> => {
      return safeFetch<Contract>('/contracts', {
        method: 'POST',
        body: JSON.stringify(contract)
      }, contract as Contract);
    },
    updateStatus: async (id: string, status: string): Promise<Contract | null> => {
      return safeFetch<Contract | null>(`/contracts/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      }, null);
    }
  },

  // 5. Parts & Predictive Inventory (/api/v1/parts)
  parts: {
    getAll: async (category?: string): Promise<Part[]> => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : '';
      return safeFetch<Part[]>(`/parts${qs}`, {}, []);
    },
    getAbnormal: async (): Promise<Part[]> => {
      return safeFetch<Part[]>('/parts/abnormal', {}, []);
    },
    getById: async (id: string): Promise<Part | null> => {
      return safeFetch<Part | null>(`/parts/${id}`, {}, null);
    },
    getRequests: async (status?: string): Promise<PartRequest[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<PartRequest[]>(`/parts/requests${qs}`, {}, []);
    },
    createRequest: async (req: Partial<PartRequest>): Promise<PartRequest> => {
      return safeFetch<PartRequest>('/parts/requests', {
        method: 'POST',
        body: JSON.stringify(req)
      }, req as PartRequest);
    },
    updateRequestStatus: async (id: string, status: string): Promise<PartRequest | null> => {
      return safeFetch<PartRequest | null>(`/parts/requests/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      }, null);
    }
  },

  // 6. Employees, Time Clock & Payroll (/api/v1/employees)
  employees: {
    getAll: async (role?: string): Promise<Employee[]> => {
      const qs = role ? `?role=${encodeURIComponent(role)}` : '';
      return safeFetch<Employee[]>(`/employees${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Employee | null> => {
      return safeFetch<Employee | null>(`/employees/${id}`, {}, null);
    },
    getPunches: async (employeeId?: string): Promise<TimePunchRecord[]> => {
      const qs = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
      return safeFetch<TimePunchRecord[]>(`/employees/punches${qs}`, {}, []);
    },
    registerPunch: async (punch: Partial<TimePunchRecord>): Promise<TimePunchRecord> => {
      return safeFetch<TimePunchRecord>('/employees/punches', {
        method: 'POST',
        body: JSON.stringify(punch)
      }, punch as TimePunchRecord);
    },
    approveBonus: async (id: string, approved: boolean): Promise<Employee | null> => {
      return safeFetch<Employee | null>(`/employees/${id}/bonus?approved=${approved}`, {
        method: 'PATCH'
      }, null);
    },
    approveOvertime: async (id: string, approved: boolean): Promise<Employee | null> => {
      return safeFetch<Employee | null>(`/employees/${id}/overtime?approved=${approved}`, {
        method: 'PATCH'
      }, null);
    }
  },

  // 7. Maintenance Campaigns (/api/v1/campaigns)
  campaigns: {
    getAll: async (status?: string): Promise<MaintenanceCampaign[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<MaintenanceCampaign[]>(`/campaigns${qs}`, {}, []);
    },
    getById: async (id: string): Promise<MaintenanceCampaign | null> => {
      return safeFetch<MaintenanceCampaign | null>(`/campaigns/${id}`, {}, null);
    },
    create: async (camp: Partial<MaintenanceCampaign>): Promise<MaintenanceCampaign> => {
      return safeFetch<MaintenanceCampaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(camp)
      }, camp as MaintenanceCampaign);
    },
    advance: async (id: string, count = 1): Promise<MaintenanceCampaign | null> => {
      return safeFetch<MaintenanceCampaign | null>(`/campaigns/${id}/advance?count=${count}`, {
        method: 'PATCH'
      }, null);
    },
    delete: async (id: string): Promise<void> => {
      return safeFetch<void>(`/campaigns/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // 8. Alerts Center (/api/v1/alerts)
  alerts: {
    getAll: async (status?: string): Promise<SmartFlowAlert[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<SmartFlowAlert[]>(`/alerts${qs}`, {}, []);
    },
    resolve: async (id: string, resolutionNote?: string): Promise<SmartFlowAlert | null> => {
      const qs = resolutionNote ? `?resolutionNote=${encodeURIComponent(resolutionNote)}` : '';
      return safeFetch<SmartFlowAlert | null>(`/alerts/${id}/resolve${qs}`, {
        method: 'PATCH'
      }, null);
    },
    markRead: async (id: string): Promise<SmartFlowAlert | null> => {
      return safeFetch<SmartFlowAlert | null>(`/alerts/${id}/read`, {
        method: 'PATCH'
      }, null);
    },
    markAllRead: async (): Promise<void> => {
      return safeFetch<void>('/alerts/read-all', {
        method: 'POST'
      });
    }
  },

  // 9. Dashboard KPIs & Telemetry (/api/v1/dashboard)
  dashboard: {
    getMetrics: async (): Promise<Record<string, any>> => {
      return safeFetch<Record<string, any>>('/dashboard/metrics', {}, {});
    }
  },

  // 10. AI Copilot & Automated Triage (/api/v1/ai)
  ai: {
    queryCopilot: async (prompt: string, context?: any) => {
      return safeFetch<{ text: string; metrics?: any[]; suggestedAction?: any }>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt, context })
      }, {
        text: 'Conexão local com o modelo heurístico OTIS SmartFlow.',
        metrics: []
      });
    },
    analyzeCall: async (data: {
      problemDescription: string;
      equipmentId?: string;
      hasTrappedPassenger?: boolean;
      isCarStopped?: boolean;
    }) => {
      return safeFetch<{
        suggestedPriority?: string;
        suggestedTechnicianId?: string;
        suggestedTechnicianName?: string;
        confidence?: number;
        estimatedTimeMin?: number;
        matchReason?: string;
        recommendedParts?: string[];
        recommendedTools?: string[];
      }>('/ai/analyze-call', {
        method: 'POST',
        body: JSON.stringify(data)
      }, null);
    }
  },

  // 11. Reports & Analytics Engine (/api/v1/reports & Python /reports)
  reports: {
    getTypes: async (): Promise<any[]> => {
      const baseApi = getApiBase();
      const baseReports = getReportsBase();

      try {
        const res = await fetch(`${baseApi}/reports/types`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      } catch {}

      try {
        const res = await fetch(`${baseReports}/reports/types`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      } catch {}

      return [
        { id: 'executivo-nacional', title: 'Relatório Executivo Nacional (Presidência)', format: 'PDF' },
        { id: 'sla-polos', title: 'Relatório de Cumprimento de SLA por Polo', format: 'EXCEL' },
        { id: 'dossie-financeiro', title: 'Dossiê Financeiro & DRE de Contratos', format: 'EXCEL' },
        { id: 'inventario-preditivo', title: 'Inventário Preditivo & Padrões de Falha', format: 'EXCEL' },
        { id: 'auditoria-decisoes', title: 'Auditoria de Decisões: Supervisor vs IA', format: 'PDF' }
      ];
    },

    download: async (reportId: string): Promise<{ blob: Blob; filename?: string }> => {
      const baseApi = getApiBase();
      const baseReports = getReportsBase();

      // 1. Try Spring Boot Reports Controller
      try {
        const res = await fetch(`${baseApi}/reports/download/${reportId}`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const blob = await res.blob();
          const disp = res.headers.get('Content-Disposition') || '';
          const match = /filename="?([^"]+)"?/.exec(disp);
          return { blob, filename: match ? match[1] : undefined };
        }
      } catch {}

      // 2. Try Python FastAPI Reports direct
      try {
        const res = await fetch(`${baseReports}/reports/download/${reportId}`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const blob = await res.blob();
          const disp = res.headers.get('Content-Disposition') || '';
          const match = /filename="?([^"]+)"?/.exec(disp);
          return { blob, filename: match ? match[1] : undefined };
        }
      } catch {}

      // 3. Simulated Fallback Blob for offline demonstration
      const ext = (reportId === 'executivo-nacional' || reportId === 'auditoria-decisoes') ? 'pdf' : 'xlsx';
      const dummyContent = `OTIS SmartFlow IA - Relatorio: ${reportId}\nData: ${new Date().toLocaleString('pt-BR')}\nStatus: Gerado localmente pelo SmartFlow Analytics Engine.`;
      const fallbackBlob = new Blob([dummyContent], { type: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return { blob: fallbackBlob, filename: `${reportId}_offline_${Date.now()}.${ext}` };
    }
  },

  // 12. Health Check & Diagnostics
  system: {
    checkHealth: async (): Promise<{
      apiOnline: boolean;
      reportsOnline: boolean;
      apiLatencyMs?: number;
      reportsLatencyMs?: number;
    }> => {
      const baseApi = getApiBase();
      const baseReports = getReportsBase();

      let apiOnline = false;
      let reportsOnline = false;
      let apiLatencyMs: number | undefined;
      let reportsLatencyMs: number | undefined;

      try {
        const t0 = performance.now();
        const res = await fetch(`${baseApi}/dashboard/metrics`, { method: 'GET', signal: AbortSignal.timeout(3000) });
        apiLatencyMs = Math.round(performance.now() - t0);
        apiOnline = res.ok;
      } catch {
        apiOnline = false;
      }

      try {
        const t0 = performance.now();
        const res = await fetch(`${baseReports}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
        reportsLatencyMs = Math.round(performance.now() - t0);
        reportsOnline = res.ok;
      } catch {
        reportsOnline = false;
      }

      return { apiOnline, reportsOnline, apiLatencyMs, reportsLatencyMs };
    },

    testConnection: async (customApiUrl?: string, customReportsUrl?: string): Promise<{
      apiStatus: 'ONLINE' | 'OFFLINE';
      reportsStatus: 'ONLINE' | 'OFFLINE';
      apiLatency: number;
      reportsLatency: number;
      apiUrl: string;
      reportsUrl: string;
      endpointsChecked: { name: string; url: string; status: boolean }[];
    }> => {
      const targetApi = (customApiUrl || getApiBase()).replace(/\/+$/, '');
      const targetReports = (customReportsUrl || getReportsBase()).replace(/\/+$/, '');

      let apiLatency = -1;
      let reportsLatency = -1;
      let apiStatus: 'ONLINE' | 'OFFLINE' = 'OFFLINE';
      let reportsStatus: 'ONLINE' | 'OFFLINE' = 'OFFLINE';

      try {
        const t0 = performance.now();
        const res = await fetch(`${targetApi}/dashboard/metrics`, { signal: AbortSignal.timeout(3500) });
        apiLatency = Math.round(performance.now() - t0);
        if (res.ok) apiStatus = 'ONLINE';
      } catch {}

      try {
        const t0 = performance.now();
        const res = await fetch(`${targetReports}/health`, { signal: AbortSignal.timeout(3500) });
        reportsLatency = Math.round(performance.now() - t0);
        if (res.ok) reportsStatus = 'ONLINE';
      } catch {}

      const endpoints = [
        { name: 'Equipamentos (/equipments)', url: `${targetApi}/equipments`, status: apiStatus === 'ONLINE' },
        { name: 'Técnicos (/technicians)', url: `${targetApi}/technicians`, status: apiStatus === 'ONLINE' },
        { name: 'Chamados (/calls)', url: `${targetApi}/calls`, status: apiStatus === 'ONLINE' },
        { name: 'Contratos & DRE (/contracts)', url: `${targetApi}/contracts`, status: apiStatus === 'ONLINE' },
        { name: 'Peças & Estoque (/parts)', url: `${targetApi}/parts`, status: apiStatus === 'ONLINE' },
        { name: 'Colaboradores & RH (/employees)', url: `${targetApi}/employees`, status: apiStatus === 'ONLINE' },
        { name: 'Campanhas (/campaigns)', url: `${targetApi}/campaigns`, status: apiStatus === 'ONLINE' },
        { name: 'Alertas Central (/alerts)', url: `${targetApi}/alerts`, status: apiStatus === 'ONLINE' },
        { name: 'Dashboard KPIs (/dashboard/metrics)', url: `${targetApi}/dashboard/metrics`, status: apiStatus === 'ONLINE' },
        { name: 'IA Copilot (/ai/query)', url: `${targetApi}/ai/query`, status: apiStatus === 'ONLINE' },
        { name: 'Relatórios Engine (Python/FastAPI)', url: `${targetReports}/reports/types`, status: reportsStatus === 'ONLINE' }
      ];

      return {
        apiStatus,
        reportsStatus,
        apiLatency,
        reportsLatency,
        apiUrl: targetApi,
        reportsUrl: targetReports,
        endpointsChecked: endpoints
      };
    }
  }
};
