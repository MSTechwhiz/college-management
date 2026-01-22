package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.List;

@Document(collection = "faculty")
public class Faculty {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String facultyId;
    
    private String name;
    private String department;
    private String role; // FACULTY, HOD
    private List<String> subjects;
    private List<String> years; // I, II, III, IV
    private String userId; // Reference to User

    public Faculty() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }

    public List<String> getYears() { return years; }
    public void setYears(List<String> years) { this.years = years; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
