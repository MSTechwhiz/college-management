package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

/**
 * Department model with field-level validation.
 * Ensures all departments have valid names and active status.
 */
@Document(collection = "departments")
public class Department {
    @Id
    private String id;

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 50, message = "Department name must be between 2 and 50 characters")
    private String name;

    private String hodId;

    @Size(max = 100, message = "HOD name cannot exceed 100 characters")
    private String hodName;

    private boolean isActive = true;

    public Department() {
    }

    public Department(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHodId() {
        return hodId;
    }

    public void setHodId(String hodId) {
        this.hodId = hodId;
    }

    public String getHodName() {
        return hodName;
    }

    public void setHodName(String hodName) {
        this.hodName = hodName;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
}
