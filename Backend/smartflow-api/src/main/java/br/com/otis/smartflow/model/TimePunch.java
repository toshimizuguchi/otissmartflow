package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "time_punches")
public class TimePunch {

    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private String timestamp;
    private String type; // ENTRADA, SAIDA_ALMOCO, RETORNO_ALMOCO, SAIDA
    private String location;
    private String notes;
    private Boolean isLate;
    private Integer lateMinutes;

    public TimePunch() {}

    public TimePunch(String id, String employeeId, String employeeName, String timestamp, 
                     String type, String location, String notes, Boolean isLate, Integer lateMinutes) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.timestamp = timestamp;
        this.type = type;
        this.location = location;
        this.notes = notes;
        this.isLate = isLate;
        this.lateMinutes = lateMinutes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getIsLate() { return isLate; }
    public void setIsLate(Boolean isLate) { this.isLate = isLate; }

    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }
}
