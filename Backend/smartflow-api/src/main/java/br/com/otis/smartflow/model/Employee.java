package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    private String id;
    private String name;
    private String email;
    private String role; // TECNICO, SUPERVISOR, GERENTE, ATENDENTE, PRESIDENTE
    private String department;
    private String region;
    private String city;
    private Double baseSalary;
    private Boolean bonusApproved;
    private Boolean overtimeApproved;
    private Double bonusAmount;
    private Double overtimeHours;
    private String status;

    public Employee() {}

    public Employee(String id, String name, String email, String role, String department, 
                    String region, String city, Double baseSalary, Boolean bonusApproved, 
                    Boolean overtimeApproved, Double bonusAmount, Double overtimeHours, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.region = region;
        this.city = city;
        this.baseSalary = baseSalary;
        this.bonusApproved = bonusApproved;
        this.overtimeApproved = overtimeApproved;
        this.bonusAmount = bonusAmount;
        this.overtimeHours = overtimeHours;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getBaseSalary() { return baseSalary; }
    public void setBaseSalary(Double baseSalary) { this.baseSalary = baseSalary; }

    public Boolean getBonusApproved() { return bonusApproved; }
    public void setBonusApproved(Boolean bonusApproved) { this.bonusApproved = bonusApproved; }

    public Boolean getOvertimeApproved() { return overtimeApproved; }
    public void setOvertimeApproved(Boolean overtimeApproved) { this.overtimeApproved = overtimeApproved; }

    public Double getBonusAmount() { return bonusAmount; }
    public void setBonusAmount(Double bonusAmount) { this.bonusAmount = bonusAmount; }

    public Double getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(Double overtimeHours) { this.overtimeHours = overtimeHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
