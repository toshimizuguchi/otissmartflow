package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "maintenance_campaigns")
public class MaintenanceCampaign {

    @Id
    private String id;
    private String title;
    private String componentTarget;
    private String modelTarget;
    private String riskDescription;
    private Integer totalTargetEquipments;
    private Integer highRiskEquipmentsCount;
    private Integer inspectedEquipmentsCount;
    private Double estimatedCost;
    private String startDate;
    private String status; // PLANEJADA, EM_ANDAMENTO, CONCLUIDA
    private String aiRootCauseHypothesis;

    public MaintenanceCampaign() {}

    public MaintenanceCampaign(String id, String title, String componentTarget, String modelTarget, 
                               String riskDescription, Integer totalTargetEquipments, 
                               Integer highRiskEquipmentsCount, Integer inspectedEquipmentsCount, 
                               Double estimatedCost, String startDate, String status, 
                               String aiRootCauseHypothesis) {
        this.id = id;
        this.title = title;
        this.componentTarget = componentTarget;
        this.modelTarget = modelTarget;
        this.riskDescription = riskDescription;
        this.totalTargetEquipments = totalTargetEquipments;
        this.highRiskEquipmentsCount = highRiskEquipmentsCount;
        this.inspectedEquipmentsCount = inspectedEquipmentsCount;
        this.estimatedCost = estimatedCost;
        this.startDate = startDate;
        this.status = status;
        this.aiRootCauseHypothesis = aiRootCauseHypothesis;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getComponentTarget() { return componentTarget; }
    public void setComponentTarget(String componentTarget) { this.componentTarget = componentTarget; }

    public String getModelTarget() { return modelTarget; }
    public void setModelTarget(String modelTarget) { this.modelTarget = modelTarget; }

    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }

    public Integer getTotalTargetEquipments() { return totalTargetEquipments; }
    public void setTotalTargetEquipments(Integer totalTargetEquipments) { this.totalTargetEquipments = totalTargetEquipments; }

    public Integer getHighRiskEquipmentsCount() { return highRiskEquipmentsCount; }
    public void setHighRiskEquipmentsCount(Integer highRiskEquipmentsCount) { this.highRiskEquipmentsCount = highRiskEquipmentsCount; }

    public Integer getInspectedEquipmentsCount() { return inspectedEquipmentsCount; }
    public void setInspectedEquipmentsCount(Integer inspectedEquipmentsCount) { this.inspectedEquipmentsCount = inspectedEquipmentsCount; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAiRootCauseHypothesis() { return aiRootCauseHypothesis; }
    public void setAiRootCauseHypothesis(String aiRootCauseHypothesis) { this.aiRootCauseHypothesis = aiRootCauseHypothesis; }
}
