import { Equipment, Technician, Call, Contract, Part, PartRequest, Employee, TimePunchRecord, MaintenanceCampaign, SmartFlowAlert } from '../types';

const env = (import.meta as any).env || {};
export const API_BASE = env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '3000' ? '/api/v1' : 'http://localhost:8080/api/v1');
export const REPORTS_BASE = env.VITE_REPORTS_URL || 'http://localhost:8000';

async function safeFetch<T>(endpoint: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
  // Equipments
  equipments: {
    getAll: async (city?: string): Promise<Equipment[]> => {
      const qs = city && city !== 'TODAS' ? `?city=${encodeURIComponent(city)}` : '';
      return safeFetch<Equipment[]>(`/equipments${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Equipment | null> => {
      return safeFetch<Equipment | null>(`/equipments/${id}`, {}, null);
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

  // Technicians
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

  // Calls & Service Tickets
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

  // Contracts & Financial DRE
  contracts: {
    getAll: async (status?: string): Promise<Contract[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<Contract[]>(`/contracts${qs}`, {}, []);
    },
    getById: async (id: string): Promise<Contract | null> => {
      return safeFetch<Contract | null>(`/contracts/${id}`, {}, null);
    },
    updateStatus: async (id: string, status: string): Promise<Contract | null> => {
      return safeFetch<Contract | null>(`/contracts/${id}/status?status=${encodeURIComponent(status)}`, {
        method: 'PATCH'
      }, null);
    }
  },

  // Parts & Inventory
  parts: {
    getAll: async (category?: string): Promise<Part[]> => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : '';
      return safeFetch<Part[]>(`/parts${qs}`, {}, []);
    },
    getAbnormal: async (): Promise<Part[]> => {
      return safeFetch<Part[]>('/parts/abnormal', {}, []);
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

  // Employees, Time Clock & HR
  employees: {
    getAll: async (role?: string): Promise<Employee[]> => {
      const qs = role ? `?role=${encodeURIComponent(role)}` : '';
      return safeFetch<Employee[]>(`/employees${qs}`, {}, []);
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

  // Maintenance Campaigns
  campaigns: {
    getAll: async (status?: string): Promise<MaintenanceCampaign[]> => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return safeFetch<MaintenanceCampaign[]>(`/campaigns${qs}`, {}, []);
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

  // SmartFlow Alerts
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

  // Dashboard & Metrics
  dashboard: {
    getMetrics: async (): Promise<Record<string, any>> => {
      return safeFetch<Record<string, any>>('/dashboard/metrics', {}, {});
    }
  },

  // AI Intelligence & Copilot
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
      return safeFetch<any>('/ai/analyze-call', {
        method: 'POST',
        body: JSON.stringify(data)
      }, null);
    }
  },

  // Health check for backend services
  system: {
    checkHealth: async (): Promise<{ apiOnline: boolean; reportsOnline: boolean }> => {
      let apiOnline = false;
      let reportsOnline = false;

      try {
        const res = await fetch(`${API_BASE}/dashboard/metrics`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        apiOnline = res.ok;
      } catch {
        apiOnline = false;
      }

      try {
        const res = await fetch(`${REPORTS_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        reportsOnline = res.ok;
      } catch {
        reportsOnline = false;
      }

      return { apiOnline, reportsOnline };
    }
  }
};
