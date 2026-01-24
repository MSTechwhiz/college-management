package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * Report model with field-level validation.
 * Enforces valid categories, statuses, and required fields for student issues.
 */
@Document(collection = "reports")
public class Report {
    @Id
    private String id;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "(Fees|Marks|Attendance|Other)", message = "Category must be Fees, Marks, Attendance, or Other")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "(Open|Resolved)", message = "Status must be Open or Resolved")
    private String status;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    private String assignedTo;

    private String resolvedBy;

    @Size(max = 500, message = "Resolution remarks cannot exceed 500 characters")
    private String resolutionRemarks;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public Report() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolutionRemarks() {
        return resolutionRemarks;
    }

    public void setResolutionRemarks(String resolutionRemarks) {
        this.resolutionRemarks = resolutionRemarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
