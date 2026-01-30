package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Faculty model with field-level validation.
 * Enforces required fields, valid roles, and ensures consistency.
 */
@Document(collection = "faculty")
public class Faculty {
    @Id
    private String id;

    @Indexed(unique = true)
    @NotBlank(message = "Faculty ID is required")
    @Size(min = 3, max = 50, message = "Faculty ID must be between 3 and 50 characters")
    private String facultyId;

    @NotBlank(message = "Faculty name is required")
    @Size(min = 2, max = 100, message = "Faculty name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "(FACULTY|HOD)", message = "Role must be FACULTY or HOD")
    private String role;

    @NotEmpty(message = "At least one subject must be assigned")
    private List<String> subjects;

    @NotEmpty(message = "At least one year must be assigned")
    private List<String> years;

    private String userId;
    
    private String dateOfBirth;

    public Faculty() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<String> subjects) {
        this.subjects = subjects;
    }

    public List<String> getYears() {
        return years;
    }

    public void setYears(List<String> years) {
        this.years = years;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
}
