package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "smartflow_alerts")
public class SmartFlowAlert {

    @Id
    private String id;
    private String type; // FINANCEIRO, OPERACIONAL, PREDITIVO, ESTOQUE, RH
    private String severity; // CRITICO, ALTO, MEDIO, INFORMATIVO
    private String title;
    private String originEntity;
    private String originInfo;
    private String reason;
    private String timestamp;
    private String status; // ATIVO, RESOLVIDO
    private Boolean isRead;
    private String actionView;
    private String actionLabel;
    private String resolvedAt;
    private String resolvedBy;
    private String resolutionNote;

    public SmartFlowAlert() {}

    public SmartFlowAlert(String id, String type, String severity, String title, 
                          String originEntity, String originInfo, String reason, 
                          String timestamp, String status, Boolean isRead, 
                          String actionView, String actionLabel, String resolvedAt, 
                          String resolvedBy, String resolutionNote) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.title = title;
        this.originEntity = originEntity;
        this.originInfo = originInfo;
        this.reason = reason;
        this.timestamp = timestamp;
        this.status = status;
        this.isRead = isRead;
        this.actionView = actionView;
        this.actionLabel = actionLabel;
        this.resolvedAt = resolvedAt;
        this.resolvedBy = resolvedBy;
        this.resolutionNote = resolutionNote;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOriginEntity() { return originEntity; }
    public void setOriginEntity(String originEntity) { this.originEntity = originEntity; }

    public String getOriginInfo() { return originInfo; }
    public void setOriginInfo(String originInfo) { this.originInfo = originInfo; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getActionView() { return actionView; }
    public void setActionView(String actionView) { this.actionView = actionView; }

    public String getActionLabel() { return actionLabel; }
    public void setActionLabel(String actionLabel) { this.actionLabel = actionLabel; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
}
