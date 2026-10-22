package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.MaintenanceCampaign;
import br.com.otis.smartflow.repository.MaintenanceCampaignRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campaigns")
@Tag(name = "Campanhas Preventivas & Preditivas", description = "Endpoints para criação e acompanhamento de campanhas nacionais contra fadiga de componentes")
public class CampaignController {

    private final MaintenanceCampaignRepository campaignRepository;

    public CampaignController(MaintenanceCampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todas as campanhas ou filtrar por status")
    public List<MaintenanceCampaign> getAllCampaigns(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return campaignRepository.findByStatus(status.toUpperCase());
        }
        return campaignRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter dados de uma campanha específica")
    public ResponseEntity<MaintenanceCampaign> getCampaignById(@PathVariable String id) {
        return campaignRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Lançar nova campanha preventiva")
    public MaintenanceCampaign createCampaign(@RequestBody MaintenanceCampaign campaign) {
        if (campaign.getId() == null || campaign.getId().isBlank()) {
            campaign.setId("camp-" + System.currentTimeMillis());
        }
        if (campaign.getInspectedEquipmentsCount() == null) {
            campaign.setInspectedEquipmentsCount(0);
        }
        if (campaign.getStatus() == null || campaign.getStatus().isBlank()) {
            campaign.setStatus("EM_ANDAMENTO");
        }
        return campaignRepository.save(campaign);
    }

    @PatchMapping("/{id}/advance")
    @Operation(summary = "Avançar contador de equipamentos inspecionados")
    public ResponseEntity<MaintenanceCampaign> advanceCampaign(@PathVariable String id, @RequestParam(defaultValue = "1") int count) {
        return campaignRepository.findById(id).map(c -> {
            int current = c.getInspectedEquipmentsCount() != null ? c.getInspectedEquipmentsCount() : 0;
            int total = c.getTotalTargetEquipments() != null ? c.getTotalTargetEquipments() : current + count;
            int updated = Math.min(total, current + count);
            c.setInspectedEquipmentsCount(updated);
            if (updated >= total) {
                c.setStatus("CONCLUIDA");
            }
            return ResponseEntity.ok(campaignRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir campanha")
    public ResponseEntity<Void> deleteCampaign(@PathVariable String id) {
        if (campaignRepository.existsById(id)) {
            campaignRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
