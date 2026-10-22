package br.com.otis.smartflow.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parts")
public class Part {

    @Id
    private String id;
    private String code;
    private String name;
    private String category;
    private Double unitCost;
    private Integer stockQuantity;
    private Integer expectedLifeSpanMonths;
    private Integer observedAverageLifeSpanMonths;
    private Integer totalReplacedLast12Months;
    private Boolean abnormalConsumptionAlert;
    private String abnormalAlertMessage;

    public Part() {}

    public Part(String id, String code, String name, String category, Double unitCost, 
                Integer stockQuantity, Integer expectedLifeSpanMonths, 
                Integer observedAverageLifeSpanMonths, Integer totalReplacedLast12Months, 
                Boolean abnormalConsumptionAlert, String abnormalAlertMessage) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.category = category;
        this.unitCost = unitCost;
        this.stockQuantity = stockQuantity;
        this.expectedLifeSpanMonths = expectedLifeSpanMonths;
        this.observedAverageLifeSpanMonths = observedAverageLifeSpanMonths;
        this.totalReplacedLast12Months = totalReplacedLast12Months;
        this.abnormalConsumptionAlert = abnormalConsumptionAlert;
        this.abnormalAlertMessage = abnormalAlertMessage;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getExpectedLifeSpanMonths() { return expectedLifeSpanMonths; }
    public void setExpectedLifeSpanMonths(Integer expectedLifeSpanMonths) { this.expectedLifeSpanMonths = expectedLifeSpanMonths; }

    public Integer getObservedAverageLifeSpanMonths() { return observedAverageLifeSpanMonths; }
    public void setObservedAverageLifeSpanMonths(Integer observedAverageLifeSpanMonths) { this.observedAverageLifeSpanMonths = observedAverageLifeSpanMonths; }

    public Integer getTotalReplacedLast12Months() { return totalReplacedLast12Months; }
    public void setTotalReplacedLast12Months(Integer totalReplacedLast12Months) { this.totalReplacedLast12Months = totalReplacedLast12Months; }

    public Boolean getAbnormalConsumptionAlert() { return abnormalConsumptionAlert; }
    public void setAbnormalConsumptionAlert(Boolean abnormalConsumptionAlert) { this.abnormalConsumptionAlert = abnormalConsumptionAlert; }

    public String getAbnormalAlertMessage() { return abnormalAlertMessage; }
    public void setAbnormalAlertMessage(String abnormalAlertMessage) { this.abnormalAlertMessage = abnormalAlertMessage; }
}
