package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

/**
 * Mark model with comprehensive field-level validation.
 * Enforces mark ranges (0-100), prevents negative values, and locks records
 * after submission.
 */
@Document(collection = "marks")
public class Mark {
    @Id
    private String id;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 100, message = "Subject must be between 2 and 100 characters")
    private String subject;

    @DecimalMin(value = "0.0", inclusive = true, message = "CA marks cannot be negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "CA marks cannot exceed 100")
    private double caMarks;

    @DecimalMin(value = "0.0", inclusive = true, message = "Model marks cannot be negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "Model marks cannot exceed 100")
    private double modelMarks;

    @DecimalMin(value = "0.0", inclusive = true, message = "Practical marks cannot be negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "Practical marks cannot exceed 100")
    private double practicalMarks;

    private double totalMarks;

    @Pattern(regexp = "(A|B|C|D|E|F)?", message = "Grade must be A, B, C, D, E, or F")
    private String grade;

    @NotBlank(message = "Faculty ID is required")
    private String facultyId;

    private boolean locked = false;

    // GPA Calculation Fields (Added)
    private String subjectCode;
    private int credits;
    private double gradePoints;
    private int semester;

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public double getGradePoints() {
        return gradePoints;
    }

    public void setGradePoints(double gradePoints) {
        this.gradePoints = gradePoints;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public Mark() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public double getCaMarks() {
        return caMarks;
    }

    public void setCaMarks(double caMarks) {
        this.caMarks = caMarks;
    }

    public double getModelMarks() {
        return modelMarks;
    }

    public void setModelMarks(double modelMarks) {
        this.modelMarks = modelMarks;
    }

    public double getPracticalMarks() {
        return practicalMarks;
    }

    public void setPracticalMarks(double practicalMarks) {
        this.practicalMarks = practicalMarks;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
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
