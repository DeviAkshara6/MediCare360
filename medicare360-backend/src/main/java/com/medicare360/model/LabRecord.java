package com.medicare360.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("labRecords")
public class LabRecord {
    @Id private String id;
    @NotBlank private String testName;
    @NotBlank private String labName;
    @NotBlank private String testDate;
    private String notes;
    private String resultsSummary;
    private String pdfFilename;
    private Long pdfSize;
    private String createdAt;

    public LabRecord() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getLabName() { return labName; }
    public void setLabName(String labName) { this.labName = labName; }
    public String getTestDate() { return testDate; }
    public void setTestDate(String testDate) { this.testDate = testDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getResultsSummary() { return resultsSummary; }
    public void setResultsSummary(String resultsSummary) { this.resultsSummary = resultsSummary; }
    public String getPdfFilename() { return pdfFilename; }
    public void setPdfFilename(String pdfFilename) { this.pdfFilename = pdfFilename; }
    public Long getPdfSize() { return pdfSize; }
    public void setPdfSize(Long pdfSize) { this.pdfSize = pdfSize; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
