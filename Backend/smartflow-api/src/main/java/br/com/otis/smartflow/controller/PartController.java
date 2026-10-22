package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.Part;
import br.com.otis.smartflow.model.PartRequest;
import br.com.otis.smartflow.repository.PartRepository;
import br.com.otis.smartflow.repository.PartRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parts")
@Tag(name = "Peças & Estoque Preditivo", description = "Endpoints para monitoramento de estoque, solicitações de técnicos e consumo anômalo")
public class PartController {

    private final PartRepository partRepository;
    private final PartRequestRepository partRequestRepository;

    public PartController(PartRepository partRepository, PartRequestRepository partRequestRepository) {
        this.partRepository = partRepository;
        this.partRequestRepository = partRequestRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todas as peças e níveis de estoque")
    public List<Part> getAllParts(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return partRepository.findByCategory(category);
        }
        return partRepository.findAll();
    }

    @GetMapping("/abnormal")
    @Operation(summary = "Listar peças com consumo anômalo detectado pela IA")
    public List<Part> getAbnormalParts() {
        return partRepository.findByAbnormalConsumptionAlertTrue();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter dados de uma peça por ID")
    public ResponseEntity<Part> getPartById(@PathVariable String id) {
        return partRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requests")
    @Operation(summary = "Listar requisições de peças feitas por técnicos em campo")
    public List<PartRequest> getAllRequests(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return partRequestRepository.findByStatus(status.toUpperCase());
        }
        return partRequestRepository.findAll();
    }

    @PostMapping("/requests")
    @Operation(summary = "Criar nova requisição de peça para um chamado")
    public PartRequest createPartRequest(@RequestBody PartRequest request) {
        if (request.getId() == null || request.getId().isBlank()) {
            request.setId("req-" + System.currentTimeMillis());
        }
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("PENDENTE");
        }
        return partRequestRepository.save(request);
    }

    @PatchMapping("/requests/{id}/status")
    @Operation(summary = "Aprovar ou rejeitar requisição de peça")
    public ResponseEntity<PartRequest> updateRequestStatus(@PathVariable String id, @RequestParam String status) {
        return partRequestRepository.findById(id).map(r -> {
            r.setStatus(status.toUpperCase());
            return ResponseEntity.ok(partRequestRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }
}
