package com.medicare360.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document("medicines")
public class Medicine {
    @Id
    private String id;
    private String ownerId;
    @NotBlank private String name;
    @NotBlank private String dosage;
    private String instructions;
    @NotBlank private String reminderTime;
    @NotBlank private String startDate;
    @NotBlank private String endDate;
    @NotNull private DoseStatus status;
    @NotBlank private String createdAt;

    public Medicine() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public DoseStatus getStatus() { return status; }
    public void setStatus(DoseStatus status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
