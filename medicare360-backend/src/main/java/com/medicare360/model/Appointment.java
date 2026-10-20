package com.medicare360.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document("appointments")
public class Appointment {
    @Id private String id;
    private String ownerId;
    @NotBlank private String doctorName;
    @NotBlank private String specialty;
    @NotBlank private String date;
    @NotBlank private String time;
    private String notes;
    @NotNull private AppointmentStatus status;
    @NotBlank private String createdAt;

    public Appointment() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
