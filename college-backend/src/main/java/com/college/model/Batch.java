package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

@Document(collection = "batches")
public class Batch {
    @Id
    private String id;

    @Indexed
    @NotBlank(message = "Name is required")
    private String name; // e.g., "2024-2028"

    @NotBlank(message = "Department is required")
    private String department;

    @Min(1)
    @Max(4)
    private int currentYear; // 1, 2, 3, 4

    @NotBlank(message = "Academic Year ID is required")
    private String academicYearId;

    public Batch() {
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(int currentYear) {
        this.currentYear = currentYear;
    }

    public String getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(String academicYearId) {
        this.academicYearId = academicYearId;
    }
}
