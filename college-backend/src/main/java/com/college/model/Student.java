package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.*;

/**
 * Student model with comprehensive field-level validation.
 * Enforces required fields, formats, and value ranges.
 */
@Document(collection = "students")
public class Student {
    @Id
    private String id;

    @Indexed(unique = true)
    @NotBlank(message = "Register number is required")
    @Size(min = 3, max = 50, message = "Register number must be between 3 and 50 characters")
    private String registerNumber;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Department is required")
    private String department;

    @Min(value = 1, message = "Year must be 1 or greater")
    @Max(value = 4, message = "Year must not exceed 4")
    private int year;

    @Min(value = 1, message = "Semester must be 1 or greater")
    @Max(value = 8, message = "Semester must not exceed 8")
    private int semester;

    @NotBlank(message = "Admission type is required")
    @Pattern(regexp = "(Counselling|Management)", message = "Admission type must be Counselling or Management")
    private String admissionType;

    private String quota;

    @Pattern(regexp = "(FG|BC|MBC|Others)?", message = "Scholarship category must be FG, BC, MBC, or Others")
    private String scholarshipCategory;

    @Indexed
    private String batch;
    @Indexed
    private String academicYear;

    private String dateOfBirth;

    @Indexed
    private String userId;

    public Student() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public String getAdmissionType() {
        return admissionType;
    }

    public void setAdmissionType(String admissionType) {
        this.admissionType = admissionType;
    }

    public String getQuota() {
        return quota;
    }

    public void setQuota(String quota) {
        this.quota = quota;
    }

    public String getScholarshipCategory() {
        return scholarshipCategory;
    }

    public void setScholarshipCategory(String scholarshipCategory) {
        this.scholarshipCategory = scholarshipCategory;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
