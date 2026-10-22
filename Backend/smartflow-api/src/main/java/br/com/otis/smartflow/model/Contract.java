package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    private String id;
    private String contractNumber;
    private String customerId;
    private String customerName;
    private String startDate;
    private String endDate;
    private Double monthlyValue;
    private Double slaRequiredRate;
    private String type;
    private Integer equipmentsCount;
    private String status;

    private Double monthlyRevenue;
    private Double monthlyPartsCost;
    private Double monthlyTechLaborCost;
    private Double monthlyTravelCost;
    private Double monthlyOtherCost;
    private Double currentMarginRate;
    private Double baselineMarginRate;
    private String marginDropAlert;
    private String aiFinancialDiagnosis;

    public Contract() {}

    public Contract(String id, String contractNumber, String customerId, String customerName, 
                    String startDate, String endDate, Double monthlyValue, Double slaRequiredRate, 
                    String type, Integer equipmentsCount, String status, Double monthlyRevenue, 
                    Double monthlyPartsCost, Double monthlyTechLaborCost, Double monthlyTravelCost, 
                    Double monthlyOtherCost, Double currentMarginRate, Double baselineMarginRate, 
                    String marginDropAlert, String aiFinancialDiagnosis) {
        this.id = id;
        this.contractNumber = contractNumber;
        this.customerId = customerId;
        this.customerName = customerName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.monthlyValue = monthlyValue;
        this.slaRequiredRate = slaRequiredRate;
        this.type = type;
        this.equipmentsCount = equipmentsCount;
        this.status = status;
        this.monthlyRevenue = monthlyRevenue;
        this.monthlyPartsCost = monthlyPartsCost;
        this.monthlyTechLaborCost = monthlyTechLaborCost;
        this.monthlyTravelCost = monthlyTravelCost;
        this.monthlyOtherCost = monthlyOtherCost;
        this.currentMarginRate = currentMarginRate;
        this.baselineMarginRate = baselineMarginRate;
        this.marginDropAlert = marginDropAlert;
        this.aiFinancialDiagnosis = aiFinancialDiagnosis;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public Double getMonthlyValue() { return monthlyValue; }
    public void setMonthlyValue(Double monthlyValue) { this.monthlyValue = monthlyValue; }

    public Double getSlaRequiredRate() { return slaRequiredRate; }
    public void setSlaRequiredRate(Double slaRequiredRate) { this.slaRequiredRate = slaRequiredRate; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getEquipmentsCount() { return equipmentsCount; }
    public void setEquipmentsCount(Integer equipmentsCount) { this.equipmentsCount = equipmentsCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(Double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public Double getMonthlyPartsCost() { return monthlyPartsCost; }
    public void setMonthlyPartsCost(Double monthlyPartsCost) { this.monthlyPartsCost = monthlyPartsCost; }

    public Double getMonthlyTechLaborCost() { return monthlyTechLaborCost; }
    public void setMonthlyTechLaborCost(Double monthlyTechLaborCost) { this.monthlyTechLaborCost = monthlyTechLaborCost; }

    public Double getMonthlyTravelCost() { return monthlyTravelCost; }
    public void setMonthlyTravelCost(Double monthlyTravelCost) { this.monthlyTravelCost = monthlyTravelCost; }

    public Double getMonthlyOtherCost() { return monthlyOtherCost; }
    public void setMonthlyOtherCost(Double monthlyOtherCost) { this.monthlyOtherCost = monthlyOtherCost; }

    public Double getCurrentMarginRate() { return currentMarginRate; }
    public void setCurrentMarginRate(Double currentMarginRate) { this.currentMarginRate = currentMarginRate; }

    public Double getBaselineMarginRate() { return baselineMarginRate; }
    public void setBaselineMarginRate(Double baselineMarginRate) { this.baselineMarginRate = baselineMarginRate; }

    public String getMarginDropAlert() { return marginDropAlert; }
    public void setMarginDropAlert(String marginDropAlert) { this.marginDropAlert = marginDropAlert; }

    public String getAiFinancialDiagnosis() { return aiFinancialDiagnosis; }
    public void setAiFinancialDiagnosis(String aiFinancialDiagnosis) { this.aiFinancialDiagnosis = aiFinancialDiagnosis; }
}
