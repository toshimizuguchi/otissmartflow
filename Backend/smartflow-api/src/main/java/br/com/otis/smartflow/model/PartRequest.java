package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "part_requests")
public class PartRequest {

    @Id
    private String id;
    private String callId;
    private String technicianId;
    private String technicianName;
    private String partId;
    private String partCode;
    private String partName;
    private Integer quantity;
    private String status; // PENDENTE, APROVADO, REJEITADO, ENTREGUE
    private String requestedAt;
    private String urgency;

    public PartRequest() {}

    public PartRequest(String id, String callId, String technicianId, String technicianName, 
                       String partId, String partCode, String partName, Integer quantity, 
                       String status, String requestedAt, String urgency) {
        this.id = id;
        this.callId = callId;
        this.technicianId = technicianId;
        this.technicianName = technicianName;
        this.partId = partId;
        this.partCode = partCode;
        this.partName = partName;
        this.quantity = quantity;
        this.status = status;
        this.requestedAt = requestedAt;
        this.urgency = urgency;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getPartId() { return partId; }
    public void setPartId(String partId) { this.partId = partId; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedAt() { return requestedAt; }
    public void setRequestedAt(String requestedAt) { this.requestedAt = requestedAt; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
}
