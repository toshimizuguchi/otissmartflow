package br.com.otis.smartflow.config;

import br.com.otis.smartflow.model.*;
import br.com.otis.smartflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EquipmentRepository equipmentRepository;
    private final TechnicianRepository technicianRepository;
    private final CallTicketRepository callTicketRepository;
    private final ContractRepository contractRepository;
    private final PartRepository partRepository;
    private final PartRequestRepository partRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final TimePunchRepository timePunchRepository;
    private final MaintenanceCampaignRepository campaignRepository;
    private final SmartFlowAlertRepository alertRepository;

    public DataInitializer(EquipmentRepository equipmentRepository,
                           TechnicianRepository technicianRepository,
                           CallTicketRepository callTicketRepository,
                           ContractRepository contractRepository,
                           PartRepository partRepository,
                           PartRequestRepository partRequestRepository,
                           EmployeeRepository employeeRepository,
                           TimePunchRepository timePunchRepository,
                           MaintenanceCampaignRepository campaignRepository,
                           SmartFlowAlertRepository alertRepository) {
        this.equipmentRepository = equipmentRepository;
        this.technicianRepository = technicianRepository;
        this.callTicketRepository = callTicketRepository;
        this.contractRepository = contractRepository;
        this.partRepository = partRepository;
        this.partRequestRepository = partRequestRepository;
        this.employeeRepository = employeeRepository;
        this.timePunchRepository = timePunchRepository;
        this.campaignRepository = campaignRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    public void run(String... args) {
        if (equipmentRepository.count() == 0) {
            Equipment eq1 = new Equipment(
                    "eq-001", "SP-GEN2-042", "Elevador Social 01", "Gen2 Comfort", "ELEVADOR_PASSAGEIROS",
                    "Condomínio Faria Lima Tower", "Torre A", "São Paulo", "SP",
                    "EM_RISCO", 89, "CRITICO",
                    "Vibração anômala no rolete AT120. Risco de travamento de porta iminente.",
                    184500, 1.2
            );

            Equipment eq2 = new Equipment(
                    "eq-002", "RJ-SKY-108", "Elevador Panorâmico Torre Sul", "SkyRise HighRise", "ELEVADOR_PANORAMICO",
                    "Centro Empresarial Botafogo", "Torre Sul", "Rio de Janeiro", "RJ",
                    "OPERACIONAL", 84, "CRITICO",
                    "Aquecimento térmico ReGen Drive acima de 68°C em horário de pico.",
                    321000, 0.0
            );

            Equipment eq3 = new Equipment(
                    "eq-003", "BH-HYD-019", "Elevador de Emergência / Macas", "HydroFit", "ELEVADOR_CARGA",
                    "Hospital Mater Dei Contorno", "Prédio Principal", "Belo Horizonte", "MG",
                    "OPERACIONAL", 76, "ALTO",
                    "Flutuação de pressão na válvula proporcional durante o nivelamento de piso.",
                    94200, 0.5
            );

            Equipment eq4 = new Equipment(
                    "eq-004", "PR-GEN2-211", "Elevador Serviço 02", "Gen2 Life", "ELEVADOR_PASSAGEIROS",
                    "Shopping Mueller Curitiba", "Edifício Garagem", "Curitiba", "PR",
                    "OPERACIONAL", 71, "ALTO",
                    "Resistividade elétrica nas cintas de tração CSB atingiu 82% do limite de desgaste.",
                    215000, 0.0
            );

            Equipment eq5 = new Equipment(
                    "eq-005", "SP-ESC-005", "Escada Rolante Acesso Principal", "Escada 606N", "ESCADA_ROLANTE",
                    "Shopping Eldorado", "Vão Central", "São Paulo", "SP",
                    "OPERACIONAL", 42, "MODERADO",
                    "Desgaste uniforme nos segmentos de pente plástico. Operação normal.",
                    450000, 0.0
            );

            equipmentRepository.saveAll(List.of(eq1, eq2, eq3, eq4, eq5));
        }

        if (technicianRepository.count() == 0) {
            Technician t1 = new Technician(
                    "tech-001", "Lucas Mendes", "lucas.mendes@otis.com", "(11) 98765-4321", "DISPONIVEL",
                    "Carlos Silveira", "São Paulo", "SP",
                    List.of("Sistema de Portas AT120", "Drives ReGen", "Comando GECB"),
                    42, 24, 38, 99.2, "Fiorino OTIS-042"
            );

            Technician t2 = new Technician(
                    "tech-002", "Rodrigo Santoro", "rodrigo.santoro@otis.com", "(21) 97654-3210", "EM_ATENDIMENTO",
                    "Marcos Vinicius", "Rio de Janeiro", "RJ",
                    List.of("SkyRise HighSpeed", "Automação", "Quadro E2"),
                    36, 31, 45, 97.8, "Kangoo OTIS-108"
            );

            Technician t3 = new Technician(
                    "tech-003", "Beatriz Lima", "beatriz.lima@otis.com", "(31) 96543-2109", "A_CAMINHO",
                    "Renata Figueiredo", "Belo Horizonte", "MG",
                    List.of("Hidráulica HydroFit", "Válvulas Proporcionais", "Segurança"),
                    39, 21, 36, 98.9, "Strada OTIS-019"
            );

            technicianRepository.saveAll(List.of(t1, t2, t3));
        }

        if (callTicketRepository.count() == 0) {
            CallTicket c1 = new CallTicket(
                    "call-001", "CH-2026-0104", "eq-001", "SP-GEN2-042",
                    "Condomínio Faria Lima Tower", "Torre A", "São Paulo",
                    "CRITICO", "EM_ATENDIMENTO",
                    "Porta do 14º andar com ruído metálico e fechamento intermitente.",
                    false, false, "tech-001", "Lucas Mendes",
                    "Substituição imediata dos roletes AT120 recomendada pelo SmartFlow IA."
            );

            CallTicket c2 = new CallTicket(
                    "call-002", "CH-2026-0105", "eq-002", "RJ-SKY-108",
                    "Centro Empresarial Botafogo", "Torre Sul", "Rio de Janeiro",
                    "ALTO", "A_CAMINHO",
                    "Variação de velocidade durante aceleração expressa entre andares 20 e 35.",
                    false, false, "tech-002", "Rodrigo Santoro",
                    "Calibração de ganho de velocidade no ReGen Drive sugerida pela IA."
            );

            callTicketRepository.saveAll(List.of(c1, c2));
        }

        if (contractRepository.count() == 0) {
            Contract ctr1 = new Contract(
                    "ctr-001", "CT-2026-089", "cust-001", "Condomínio Faria Lima Tower",
                    "2024-01-01", "2027-01-01", 18500.0, 99.0, "PREMIUM_ALL_INCLUSIVE", 8,
                    "EM_RISCO", 18500.0, 4800.0, 5200.0, 1100.0, 800.0,
                    18.2, 28.0, "Margem comprimida por reincidência de falha no sistema de portas.",
                    "Alto consumo de kits de reposição AT120 nos últimos 60 dias."
            );

            Contract ctr2 = new Contract(
                    "ctr-002", "CT-2026-112", "cust-002", "Centro Empresarial Botafogo",
                    "2023-06-01", "2026-06-01", 24200.0, 98.5, "STANDARD_COM_PECAS", 12,
                    "ATIVO", 24200.0, 2100.0, 4300.0, 950.0, 600.0,
                    32.4, 30.0, null, "Contrato com rentabilidade saudável e operação estável."
            );

            contractRepository.saveAll(List.of(ctr1, ctr2));
        }

        if (partRepository.count() == 0) {
            Part p1 = new Part(
                    "part-001", "OTIS-AT120-SK", "Kit Roletes & Sapata AT120", "SISTEMA_PORTAS",
                    680.0, 142, 36, 18, 318,
                    true, "Consumo 44% acima da média histórica devido a ciclo de fadiga precoce."
            );

            Part p2 = new Part(
                    "part-002", "OTIS-RGN-INV2", "Inversor Regenerativo ReGen 15kW", "TRACAO_ELETRICA",
                    4200.0, 28, 60, 58, 12,
                    false, null
            );

            Part p3 = new Part(
                    "part-003", "OTIS-606N-SEG", "Segmento de Pente Plástico Amarelo 606N", "ESCADA_ROLANTE",
                    145.0, 310, 24, 23, 85,
                    false, null
            );

            partRepository.saveAll(List.of(p1, p2, p3));
        }

        if (employeeRepository.count() == 0) {
            Employee emp1 = new Employee(
                    "emp-001", "Lucas Mendes", "lucas.mendes@otis.com", "TECNICO",
                    "Operações Técnicas", "Sudeste", "São Paulo", 4800.0,
                    true, true, 480.0, 14.5, "ATIVO"
            );

            Employee emp2 = new Employee(
                    "emp-002", "Carlos Silveira", "carlos.silveira@otis.com", "SUPERVISOR",
                    "Supervisão Regional", "Sudeste", "São Paulo", 8200.0,
                    true, false, 820.0, 0.0, "ATIVO"
            );

            Employee emp3 = new Employee(
                    "emp-003", "Roberto Takahashi", "roberto.takahashi@otis.com", "GERENTE",
                    "Gerência de Operações", "Nacional", "São Paulo", 15400.0,
                    true, false, 1540.0, 0.0, "ATIVO"
            );

            employeeRepository.saveAll(List.of(emp1, emp2, emp3));
        }

        if (campaignRepository.count() == 0) {
            MaintenanceCampaign camp1 = new MaintenanceCampaign(
                    "camp-001", "Campanha Preventiva Nacional: Portas AT120 (Gen2)", "Operador de Porta AT120", "Gen2 Comfort",
                    "Substituição proativa de sapatas e roletes nos equipamentos fabricados entre 2021 e 2023.",
                    420, 89, 134, 185000.0, "2026-09-15", "EM_ANDAMENTO",
                    "Fadiga acelerada sob alta temperatura e umidade nos polos ABC Paulista e Campinas."
            );

            campaignRepository.save(camp1);
        }

        if (alertRepository.count() == 0) {
            SmartFlowAlert a1 = new SmartFlowAlert(
                    "alert-001", "PREDITIVO", "CRITICO",
                    "Risco Crítico no Elevador Social 01 (Faria Lima Tower)",
                    "Equipamento", "SP-GEN2-042",
                    "Micro-vibrações detectadas nos roletes AT120 indicam risco de travamento em menos de 48h.",
                    LocalDateTime.now().minusHours(2).toString(), "ATIVO", false,
                    "equipments", "Ver Equipamento", null, null, null
            );

            SmartFlowAlert a2 = new SmartFlowAlert(
                    "alert-002", "FINANCEIRO", "ALTO",
                    "Compressão de Margem no Contrato Faria Lima Tower",
                    "Contrato", "CT-2026-089",
                    "Margem operacional caiu de 28% para 18.2% devido à reincidência de manutenções corretivas.",
                    LocalDateTime.now().minusHours(5).toString(), "ATIVO", false,
                    "financial", "Ver DRE Contrato", null, null, null
            );

            alertRepository.saveAll(List.of(a1, a2));
        }

        System.out.println(">>> SmartFlow DataInitializer: Banco de dados populado com sucesso (Equipamentos, Técnicos, Chamados, Contratos, Peças, RH, Campanhas e Alertas)!");
    }
}
