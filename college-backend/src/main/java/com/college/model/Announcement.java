package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * Announcement model with field-level validation.
 * Enforces required fields, valid targets, and date constraints.
 */
@Document(collection = "announcements")
@CompoundIndex(def = "{'target':1, 'department':1, 'publishDate':-1}")
public class Announcement {
    @Id
    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;

    @NotBlank(message = "Target is required")
    @Pattern(regexp = "(ALL|STUDENTS|FACULTY|DEPARTMENT)", message = "Target must be ALL, STUDENTS, FACULTY, or DEPARTMENT")
    private String target;

    private String department;

    @PastOrPresent(message = "Publish date cannot be in the future")
    private LocalDateTime publishDate;

    private LocalDateTime createdAt;

    @NotBlank(message = "Created by is required")
    private String createdBy;

    public Announcement() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDateTime getPublishDate() {
        return publishDate;
    }

    public void setPublishDate(LocalDateTime publishDate) {
        this.publishDate = publishDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
