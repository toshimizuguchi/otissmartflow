export const INITIAL_EQUIPMENTS = [
  {
    id: 'EQ-001',
    code: 'OTIS-GEN2-001',
    model: 'Gen2 Comfort',
    type: 'PASSENGER',
    status: 'NORMAL',
    clientName: 'Hospital São Luiz Morumbi',
    address: 'R. Eng. Oscar Americano, 840 - Morumbi, São Paulo - SP',
    city: 'São Paulo',
    state: 'SP',
    floors: 14,
    capacityKg: 1050,
    installationDate: '2021-04-10',
    lastMaintenanceDate: '2026-10-15',
    nextMaintenanceDate: '2026-11-15',
    riskLevel: 'LOW',
    telemetry: {
      temperatureC: 28.4,
      vibrationMmS: 1.2,
      doorCyclesToday: 342,
      totalTrips: 184500,
      currentFloor: 5,
      doorState: 'CLOSED',
      motorCurrentA: 18.5,
      isEmergencyActive: false
    }
  },
  {
    id: 'EQ-002',
    code: 'OTIS-SKYRISE-002',
    model: 'SkyRise High-Speed',
    type: 'PASSENGER',
    status: 'WARNING',
    clientName: 'Edifício Infinity Tower',
    address: 'Av. Brg. Faria Lima, 3600 - Itaim Bibi, São Paulo - SP',
    city: 'São Paulo',
    state: 'SP',
    floors: 32,
    capacityKg: 1600,
    installationDate: '2019-08-20',
    lastMaintenanceDate: '2026-10-01',
    nextMaintenanceDate: '2026-11-01',
    riskLevel: 'HIGH',
    telemetry: {
      temperatureC: 41.2,
      vibrationMmS: 3.8,
      doorCyclesToday: 580,
      totalTrips: 340120,
      currentFloor: 18,
      doorState: 'OPEN',
      motorCurrentA: 26.1,
      isEmergencyActive: false
    }
  },
  {
    id: 'EQ-003',
    code: 'OTIS-GEN2-003',
    model: 'Gen2 Life',
    type: 'PASSENGER',
    status: 'NORMAL',
    clientName: 'Shopping Iguatemi Campinas',
    address: 'Av. Iguatemi, 777 - Vila Brandina, Campinas - SP',
    city: 'Campinas',
    state: 'SP',
    floors: 4,
    capacityKg: 1250,
    installationDate: '2022-01-15',
    lastMaintenanceDate: '2026-10-10',
    nextMaintenanceDate: '2026-11-10',
    riskLevel: 'LOW',
    telemetry: {
      temperatureC: 25.1,
      vibrationMmS: 0.9,
      doorCyclesToday: 890,
      totalTrips: 120000,
      currentFloor: 1,
      doorState: 'CLOSED',
      motorCurrentA: 15.2,
      isEmergencyActive: false
    }
  }
];

export const INITIAL_TECHNICIANS = [
  {
    id: 'TEC-001',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@otis.com',
    phone: '(11) 98765-4321',
    city: 'São Paulo',
    state: 'SP',
    region: 'Zona Sul / Berrini',
    status: 'EM_ATENDIMENTO',
    currentLocation: {
      lat: -23.5985,
      lng: -46.6872,
      address: 'Av. Eng. Luís Carlos Berrini, 105 - Itaim Bibi, São Paulo'
    },
    supervisorId: 'sup-1',
    supervisorName: 'Roberto Viana',
    assignedVehicle: 'Fiorino SmartFlow #14 (Placa BRA-4E29)',
    completedCallsMonth: 38,
    avgArrivalTimeMin: 19,
    avgSolutionTimeMin: 34,
    slaComplianceRate: 98.6,
    activeCallId: 'CAL-001',
    completedToday: 2,
    rating: 4.9,
    specialties: ['Sistema de Portas', 'Otis Gen2 Comfort', 'Drives Regenerativos']
  },
  {
    id: 'TEC-002',
    name: 'Marcos Vinicius Souza',
    email: 'marcos.souza@otis.com',
    phone: '(11) 99876-5432',
    city: 'São Paulo',
    state: 'SP',
    region: 'Paulista / Centro',
    status: 'DISPONIVEL',
    currentLocation: {
      lat: -23.5615,
      lng: -46.6560,
      address: 'Av. Paulista, 1578 - Bela Vista, São Paulo'
    },
    supervisorId: 'sup-1',
    supervisorName: 'Roberto Viana',
    assignedVehicle: 'Fiorino SmartFlow #18 (Placa OTIS-9K12)',
    completedCallsMonth: 44,
    avgArrivalTimeMin: 16,
    avgSolutionTimeMin: 23,
    slaComplianceRate: 99.2,
    activeCallId: null,
    completedToday: 3,
    rating: 4.8,
    specialties: ['Sistema de Portas', 'Operadores AT120', 'Quadros MCS']
  },
  {
    id: 'TEC-003',
    name: 'Felipe Albuquerque',
    email: 'felipe.albuquerque@otis.com',
    phone: '(19) 97123-4567',
    city: 'Campinas',
    state: 'SP',
    region: 'Campinas Central / RMC',
    status: 'DISPONIVEL',
    currentLocation: {
      lat: -22.9064,
      lng: -47.0616,
      address: 'Av. Iguatemi, 777 - Vila Brandina, Campinas'
    },
    supervisorId: 'sup-1',
    supervisorName: 'Roberto Viana',
    assignedVehicle: 'Strada SmartFlow #07 (Placa FLW-8T55)',
    completedCallsMonth: 29,
    avgArrivalTimeMin: 22,
    avgSolutionTimeMin: 41,
    slaComplianceRate: 97.4,
    activeCallId: null,
    completedToday: 4,
    rating: 4.95,
    specialties: ['Escadas Rolantes 510 NPE', 'Mecânica Pesada', 'Otis SkyRise']
  }
];

export const INITIAL_CALLS = [
  {
    id: 'CAL-001',
    code: 'OS-2026-1049',
    equipmentId: 'EQ-001',
    clientName: 'Hospital São Luiz Morumbi',
    address: 'R. Eng. Oscar Americano, 840 - Morumbi, São Paulo - SP',
    city: 'São Paulo',
    type: 'CORRETIVA',
    priority: 'EMERGENCIA',
    status: 'EM_ANDAMENTO',
    hasTrappedPassenger: true,
    isCarStopped: true,
    floorStopped: 5,
    description: 'Elevador parado no 5º andar com 2 passageiros retidos. Portas travadas.',
    technicianId: 'TEC-001',
    technicianName: 'Carlos Oliveira',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    slaLimitMinutes: 45,
    minutesRemaining: 12
  },
  {
    id: 'CAL-002',
    code: 'OS-2026-1050',
    equipmentId: 'EQ-002',
    clientName: 'Edifício Infinity Tower',
    address: 'Av. Brg. Faria Lima, 3600 - Itaim Bibi, São Paulo - SP',
    city: 'São Paulo',
    type: 'PREVENTIVA',
    priority: 'ALTA',
    status: 'ABERTO',
    hasTrappedPassenger: false,
    isCarStopped: false,
    floorStopped: null,
    description: 'Alerta preditivo de alta temperatura no inversor de tração e vibração elevada.',
    technicianId: null,
    technicianName: null,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    slaLimitMinutes: 120,
    minutesRemaining: 105
  }
];

export const INITIAL_CONTRACTS = [
  {
    id: 'CTR-001',
    contractNumber: 'CTR-OTIS-2024-88',
    clientName: 'Hospital São Luiz Morumbi',
    planType: 'FULL_SERVICE_VIP',
    monthlyValue: 14800.0,
    costAccumulated: 3420.0,
    marginPercent: 76.8,
    status: 'ATIVO',
    slaTargetMin: 45,
    startDate: '2024-01-01',
    endDate: '2027-01-01',
    equipmentCount: 6
  },
  {
    id: 'CTR-002',
    contractNumber: 'CTR-OTIS-2023-14',
    clientName: 'Edifício Infinity Tower',
    planType: 'PREMIUM_COMMERCIAL',
    monthlyValue: 28500.0,
    costAccumulated: 8900.0,
    marginPercent: 68.7,
    status: 'ATIVO',
    slaTargetMin: 60,
    startDate: '2023-06-01',
    endDate: '2026-12-31',
    equipmentCount: 12
  }
];

export const INITIAL_PARTS = [
  {
    id: 'PRT-001',
    code: 'AAA26800AB1',
    name: 'Placa Principal GECB-II',
    category: 'ELETRONICA',
    stockQuantity: 18,
    minStockQuantity: 5,
    priceUnit: 4200.0,
    compatibleModels: ['Gen2', 'SkyRise'],
    supplier: 'Otis Tech Supply',
    isAbnormalUsage: false
  },
  {
    id: 'PRT-002',
    code: 'AAA6160CJ2',
    name: 'Operador de Porta AT120',
    category: 'MECANICA_PORTA',
    stockQuantity: 3,
    minStockQuantity: 8,
    priceUnit: 1850.0,
    compatibleModels: ['Gen2 Life', 'Gen2 Comfort'],
    supplier: 'Otis Tech Supply',
    isAbnormalUsage: true
  }
];

export const INITIAL_PART_REQUESTS = [
  {
    id: 'REQ-001',
    partId: 'PRT-002',
    partName: 'Operador de Porta AT120',
    quantity: 2,
    callId: 'CAL-001',
    technicianId: 'TEC-001',
    technicianName: 'Carlos Oliveira',
    urgency: 'ALTA',
    status: 'PENDENTE',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-001',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@otis.com',
    role: 'TECNICO_SR',
    city: 'São Paulo',
    baseSalary: 6200.0,
    overtimeHours: 8.5,
    overtimeApproved: false,
    bonusAmount: 1100.0,
    bonusApproved: true,
    scoreQuality: 98
  },
  {
    id: 'EMP-002',
    name: 'Marcos Vinicius Souza',
    email: 'marcos.souza@otis.com',
    role: 'TECNICO_PL',
    city: 'São Paulo',
    baseSalary: 4800.0,
    overtimeHours: 4.0,
    overtimeApproved: true,
    bonusAmount: 750.0,
    bonusApproved: true,
    scoreQuality: 95
  }
];

export const INITIAL_TIME_PUNCHES = [
  {
    id: 'PCH-001',
    employeeId: 'EMP-001',
    employeeName: 'Carlos Oliveira',
    punchType: 'ENTRADA',
    timestamp: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    isWithinGeoFence: true
  },
  {
    id: 'PCH-002',
    employeeId: 'EMP-001',
    employeeName: 'Carlos Oliveira',
    punchType: 'ALMOCO_SAIDA',
    timestamp: new Date(new Date().setHours(12, 5, 0, 0)).toISOString(),
    isWithinGeoFence: true
  }
];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'CMP-001',
    title: 'Modernização de Fitas Flat de Tração Gen2',
    description: 'Campanha preventiva de substituição das cintas de aço revestidas por poliuretano.',
    targetCount: 45,
    completedCount: 28,
    status: 'EM_ANDAMENTO',
    deadline: '2026-12-15',
    priority: 'ALTA'
  },
  {
    id: 'CMP-002',
    title: 'Atualização Firmware IoT Otis ONE',
    description: 'Atualização de segurança e novos algoritmos de telemetria preditiva de vibração.',
    targetCount: 120,
    completedCount: 94,
    status: 'EM_ANDAMENTO',
    deadline: '2026-11-30',
    priority: 'MEDIA'
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'ALT-001',
    equipmentId: 'EQ-002',
    equipmentCode: 'OTIS-SKYRISE-002',
    title: 'Temperatura Excessiva no Inversor',
    description: 'Sensor térmico registrou 41.2°C no módulo IGBT, 18% acima da curva normal.',
    severity: 'ALTA',
    isRead: false,
    isResolved: false,
    resolutionNote: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ALT-002',
    equipmentId: 'EQ-001',
    equipmentCode: 'OTIS-GEN2-001',
    title: 'Passageiro Retido - Despacho Prioritário',
    description: 'Chamado de emergência gerado automaticamente por telemetria de segurança.',
    severity: 'CRITICA',
    isRead: true,
    isResolved: false,
    resolutionNote: null,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
  }
];
