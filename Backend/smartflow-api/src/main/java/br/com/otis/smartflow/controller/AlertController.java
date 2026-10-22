package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.SmartFlowAlert;
import br.com.otis.smartflow.repository.SmartFlowAlertRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@Tag(name = "Central de Alertas & Inteligência", description = "Endpoints para monitoramento de desvios operacionais, SLA, financeiro e fadiga preditiva")
public class AlertController {

    private final SmartFlowAlertRepository alertRepository;

    public AlertController(SmartFlowAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @GetMapping
    @Operation(summary = "Listar alertas ou filtrar por status (ATIVO, RESOLVIDO)")
    public List<SmartFlowAlert> getAllAlerts(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return alertRepository.findByStatusOrderByTimestampDesc(status.toUpperCase());
        }
        return alertRepository.findAll();
    }

    @PatchMapping("/{id}/resolve")
    @Operation(summary = "Resolver alerta com anotação operacional")
    public ResponseEntity<SmartFlowAlert> resolveAlert(@PathVariable String id, @RequestParam(required = false) String resolutionNote) {
        return alertRepository.findById(id).map(a -> {
            a.setStatus("RESOLVIDO");
            a.setResolvedAt(LocalDateTime.now().toString());
            a.setResolvedBy("Supervisor do Polo");
            if (resolutionNote != null) a.setResolutionNote(resolutionNote);
            return ResponseEntity.ok(alertRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marcar alerta individual como lido")
    public ResponseEntity<SmartFlowAlert> markAsRead(@PathVariable String id) {
        return alertRepository.findById(id).map(a -> {
            a.setIsRead(true);
            return ResponseEntity.ok(alertRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/read-all")
    @Operation(summary = "Marcar todos os alertas como lidos")
    public ResponseEntity<Void> markAllAsRead() {
        List<SmartFlowAlert> unread = alertRepository.findByIsReadFalse();
        unread.forEach(a -> a.setIsRead(true));
        alertRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
