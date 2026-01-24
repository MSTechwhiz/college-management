package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

/**
 * Attendance model with field-level validation.
 * Enforces required fields and prevents modification after locking.
 */
@Document(collection = "attendance")
@CompoundIndex(def = "{'studentId':1, 'subject':1, 'date':1, 'semester':1}")
public class Attendance {
    @Id
    private String id;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 100, message = "Subject must be between 2 and 100 characters")
    private String subject;

    @NotBlank(message = "Date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must be in YYYY-MM-DD format")
    private String date;

    private boolean present;

    @NotBlank(message = "Faculty ID is required")
    private String facultyId;

    @Min(value = 1, message = "Semester must be 1 or greater")
    @Max(value = 8, message = "Semester must not exceed 8")
    private int semester;

    private boolean locked = false;

    public Attendance() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
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

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }
}
