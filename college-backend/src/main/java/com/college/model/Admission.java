package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * Admission model with comprehensive field-level validation.
 * Enforces required fields, data formats, and value constraints.
 */
@Document(collection = "admissions")
public class Admission {
    @Id
    private String id;

    private String registerNumber;

    @NotBlank(message = "Department is required")
    private String department;

    @Pattern(regexp = "(Counselling|Management|COUNSELLING|MANAGEMENT)", message = "Admission method must be Counselling or Management")
    private String admissionMethod;

    private String quota;

    @Pattern(regexp = "(FG|BC|MBC|Others)?", message = "Scholarship category must be FG, BC, MBC, or Others")
    private String scholarshipCategory;

    @PastOrPresent(message = "Admission date cannot be in the future")
    private LocalDateTime admissionDate;

    @NotBlank(message = "Student name is required")
    @Size(min = 2, max = 100, message = "Student name must be between 2 and 100 characters")
    private String studentName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be a valid 10-digit number")
    private String phone;

    @Pattern(regexp = "(Pending|Approved|Rejected)", message = "Status must be Pending, Approved, or Rejected")
    private String status;

    private String tenthMarks;

    private String twelfthMarks;

    private Double cutoff;

    // Mandatory fields
    private String studentId;

    @NotBlank(message = "Department ID is required")
    private String departmentId;

    @NotBlank(message = "Academic year is required")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Academic year must be in format YYYY-YYYY")
    private String academicYear;

    @NotBlank(message = "Admission status is required")
    @Pattern(regexp = "(APPLIED|APPROVED|REJECTED)", message = "Admission status must be APPLIED, APPROVED, or REJECTED")
    private String admissionStatus;

    private LocalDateTime createdAt;

    public Admission() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTenthMarks() {
        return tenthMarks;
    }

    public void setTenthMarks(String tenthMarks) {
        this.tenthMarks = tenthMarks;
    }

    public String getTwelfthMarks() {
        return twelfthMarks;
    }

    public void setTwelfthMarks(String twelfthMarks) {
        this.twelfthMarks = twelfthMarks;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAdmissionMethod() {
        return admissionMethod;
    }

    public void setAdmissionMethod(String admissionMethod) {
        this.admissionMethod = admissionMethod;
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

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public Double getCutoff() {
        return cutoff;
    }

    public void setCutoff(Double cutoff) {
        this.cutoff = cutoff;
    }

    // New getters and setters
    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getAdmissionStatus() {
        return admissionStatus;
    }

    public void setAdmissionStatus(String admissionStatus) {
        this.admissionStatus = admissionStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
