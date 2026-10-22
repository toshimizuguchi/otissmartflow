package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.Equipment;
import br.com.otis.smartflow.model.Technician;
import br.com.otis.smartflow.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "Inteligência Artificial & Copilot", description = "Endpoints de inteligência preditiva, triagem automatizada e copiloto de tomada de decisão")
public class AiController {

    private final EquipmentRepository equipmentRepository;
    private final TechnicianRepository technicianRepository;
    private final CallTicketRepository callTicketRepository;
    private final ContractRepository contractRepository;
    private final PartRepository partRepository;

    public AiController(EquipmentRepository equipmentRepository,
                        TechnicianRepository technicianRepository,
                        CallTicketRepository callTicketRepository,
                        ContractRepository contractRepository,
                        PartRepository partRepository) {
        this.equipmentRepository = equipmentRepository;
        this.technicianRepository = technicianRepository;
        this.callTicketRepository = callTicketRepository;
        this.contractRepository = contractRepository;
        this.partRepository = partRepository;
    }

    public static class AiQueryRequest {
        public String prompt;
        public Map<String, Object> context;
    }

    public static class CallAnalysisRequest {
        public String problemDescription;
        public String equipmentId;
        public Boolean hasTrappedPassenger;
        public Boolean isCarStopped;
    }

    @PostMapping("/query")
    @Operation(summary = "Consultar o SmartFlow AI Copilot com análise preditiva integrada")
    public Map<String, Object> queryCopilot(@RequestBody AiQueryRequest request) {
        String prompt = request.prompt != null ? request.prompt.toLowerCase() : "";
        Map<String, Object> response = new HashMap<>();

        if (prompt.contains("risco") || prompt.contains("equipamento") || prompt.contains("quebr")) {
            List<Equipment> highRisk = equipmentRepository.findByRiskLevel("CRITICO");
            response.put("text", "O SmartFlow IA identificou " + highRisk.size() + " equipamentos com Risco Crítico de falha nos próximos 15 dias. " +
                    "Recomenda-se acionar campanha preventiva para substituição antecipada do kit de roletes AT120.");
            response.put("metrics", List.of(
                    Map.of("label", "Equipamentos Críticos", "value", String.valueOf(highRisk.size()), "trend", "Atenção Imediata"),
                    Map.of("label", "Score Médio", "value", "86/100", "trend", "Crítico")
            ));
            response.put("suggestedAction", Map.of("label", "Ver Módulo Preditivo", "actionType", "NAVIGATE_PREDICTIVE"));
        } else if (prompt.contains("contrato") || prompt.contains("margem") || prompt.contains("financeiro")) {
            long riskContracts = contractRepository.findByStatus("EM_RISCO").size();
            response.put("text", "Diagnóstico Financeiro OTIS: Foram encontrados " + riskContracts + " contratos com compressão de margem devido a reincidência de chamados e consumo elevado de peças.");
            response.put("metrics", List.of(
                    Map.of("label", "Contratos em Risco", "value", String.valueOf(riskContracts), "trend", "Margem < 20%"),
                    Map.of("label", "Meta de Margem", "value", "28.0%", "trend", "Meta")
            ));
            response.put("suggestedAction", Map.of("label", "Ver Detalhamento Financeiro", "actionType", "NAVIGATE_FINANCIAL"));
        } else {
            response.put("text", "Olá! Sou o SmartFlow Copilot IA da OTIS. Estou conectado ao backend Spring Boot e ao motor de relatórios Python, monitorando toda a frota de equipamentos, chamados e técnicos em tempo real.");
            response.put("metrics", List.of(
                    Map.of("label", "Disponibilidade Frota", "value", "99.1%", "trend", "+0.7% vs meta"),
                    Map.of("label", "SLA Global", "value", "98.4%", "trend", "Excelente")
            ));
        }

        return response;
    }

    @PostMapping("/analyze-call")
    @Operation(summary = "Triagem automática de chamado com recomendação de técnico, peças e prioridade")
    public Map<String, Object> analyzeCall(@RequestBody CallAnalysisRequest req) {
        Map<String, Object> result = new HashMap<>();

        boolean critical = (req.hasTrappedPassenger != null && req.hasTrappedPassenger) ||
                (req.isCarStopped != null && req.isCarStopped) ||
                (req.problemDescription != null && (req.problemDescription.toLowerCase().contains("preso") || req.problemDescription.toLowerCase().contains("parado")));

        String priority = critical ? "CRITICO" : "ALTO";

        List<Technician> techs = technicianRepository.findByStatus("DISPONIVEL");
        Technician selectedTech = !techs.isEmpty() ? techs.get(0) : technicianRepository.findAll().stream().findFirst().orElse(null);

        result.put("suggestedPriority", priority);
        result.put("suggestedTechnicianId", selectedTech != null ? selectedTech.getId() : "tech-001");
        result.put("suggestedTechnicianName", selectedTech != null ? selectedTech.getName() : "Técnico de Plantão");
        result.put("confidence", 94.5);
        result.put("estimatedTimeMin", critical ? 20 : 35);
        result.put("matchReason", selectedTech != null ?
                selectedTech.getName() + " está disponível na região com SLA histórico de " + selectedTech.getSlaComplianceRate() + "%" :
                "Alocação automática pelo SmartFlow IA");
        result.put("recommendedParts", List.of("Kit Roletes & Sapata AT120 (OTIS-AT120-SK)", "Micro-switch de Segurança 24V"));
        result.put("recommendedTools", List.of("Gabarito de Folga de Porta 6mm", "Chave Dinamométrica Otis", "Multímetro Calibrado CAT III"));

        return result;
    }
}
