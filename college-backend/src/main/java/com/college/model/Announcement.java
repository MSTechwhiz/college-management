package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "announcements")
public class Announcement {
    @Id
    private String id;
    
    private String title;
    private String content;
    private String target; // ALL, STUDENTS, FACULTY, DEPARTMENT
    private String department; // If target is DEPARTMENT
    private LocalDateTime publishDate;
    private LocalDateTime createdAt;
    private String createdBy; // Admin or HOD ID

    public Announcement() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDateTime getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDateTime publishDate) { this.publishDate = publishDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
