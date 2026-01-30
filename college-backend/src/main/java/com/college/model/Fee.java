package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Fee model with comprehensive validation and fee type categorization.
 * Supports 5 fee types: Tuition, Exam, Bus, Hostel, Other
 * Status transitions: PENDING → PARTIAL → PAID (state machine enforced)
 */
@Document(collection = "fees")
@CompoundIndex(def = "{'studentId':1, 'year':1, 'semester':1, 'feeType':1}")
@CompoundIndex(def = "{'registerNumber':1, 'department':1, 'semester':1}")
public class Fee {
    @Id
    private String id;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    private String studentName;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    @NotBlank(message = "Department is required")
    private String department;

    @Min(value = 1, message = "Year must be 1 or greater")
    @Max(value = 4, message = "Year must not exceed 4")
    private int year;

    @Min(value = 1, message = "Semester must be 1 or greater")
    @Max(value = 8, message = "Semester must not exceed 8")
    private int semester;

    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    private double totalAmount;

    @DecimalMin(value = "0.0", message = "Paid amount cannot be negative")
    private double paidAmount;

    @DecimalMin(value = "0.0", message = "Pending amount cannot be negative")
    private double pendingAmount;

    @Pattern(regexp = "PENDING|PARTIAL|PAID", message = "Status must be PENDING, PARTIAL, or PAID")
    @Indexed
    private String status; // PENDING, PARTIAL, PAID

    private List<FeeOverride> overrides;
    private List<Payment> payments;
    private List<Installment> installments;

    @NotBlank(message = "Fee type is required")
    @Pattern(regexp = "Tuition|Exam|Bus|Hostel|Other|Term|Semester|Common", message = "Fee type must be Tuition, Exam, Bus, Hostel, Other, Term, Semester, or Common")
    private String feeType; // Tuition, Exam, Bus, Hostel, Other, Term, Semester, Common

    private java.util.Map<String, Double> breakdown;

    @PastOrPresent(message = "Due date cannot be in the future")
    private java.time.LocalDateTime dueDate;

    @PastOrPresent(message = "Created date cannot be in the future")
    private java.time.LocalDateTime createdDate;

    private String batch;
    @Indexed
    private String academicYear;
    private java.time.LocalDateTime paymentDate;
    private String paymentMode;

    // Getters and Settersconcurrency safety
    private String lastProcessedPaymentId;
    private long lastProcessedVersion = 0;
    private java.time.LocalDateTime lastPaymentProcessedAt;

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public java.util.Map<String, Double> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(java.util.Map<String, Double> breakdown) {
        this.breakdown = breakdown;
    }

    public java.time.LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(java.time.LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public java.time.LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(java.time.LocalDateTime createdDate) {
        this.createdDate = createdDate;
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

    public java.time.LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(java.time.LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getLastProcessedPaymentId() {
        return lastProcessedPaymentId;
    }

    public void setLastProcessedPaymentId(String lastProcessedPaymentId) {
        this.lastProcessedPaymentId = lastProcessedPaymentId;
    }

    public long getLastProcessedVersion() {
        return lastProcessedVersion;
    }

    public void setLastProcessedVersion(long lastProcessedVersion) {
        this.lastProcessedVersion = lastProcessedVersion;
    }

    public java.time.LocalDateTime getLastPaymentProcessedAt() {
        return lastPaymentProcessedAt;
    }

    public void setLastPaymentProcessedAt(java.time.LocalDateTime lastPaymentProcessedAt) {
        this.lastPaymentProcessedAt = lastPaymentProcessedAt;
    }

    public Fee() {
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
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

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public double getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(double pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public List<FeeOverride> getOverrides() {
        return overrides;
    }

    public void setOverrides(List<FeeOverride> overrides) {
        this.overrides = overrides;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<Installment> getInstallments() {
        return installments;
    }

    public void setInstallments(List<Installment> installments) {
        this.installments = installments;
    }

    public static class FeeOverride {
        private double amount;
        private String reason;
        private String adminId;
        private String timestamp;

        public FeeOverride() {
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getAdminId() {
            return adminId;
        }

        public void setAdminId(String adminId) {
            this.adminId = adminId;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }

    public static class Payment {
        private double amount;
        private String method; // CASH, ONLINE, CHEQUE
        private String adminId;
        private String timestamp;

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getMethod() {
            return method;
        }

        public void setMethod(String method) {
            this.method = method;
        }

        public String getAdminId() {
            return adminId;
        }

        public void setAdminId(String adminId) {
            this.adminId = adminId;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }

    public static class Installment {
        private int index;
        private double amount;
        private double paidAmount;
        private java.time.LocalDateTime dueDate;
        private String status;
        private String lastPaymentRecordId;

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public double getPaidAmount() {
            return paidAmount;
        }

        public void setPaidAmount(double paidAmount) {
            this.paidAmount = paidAmount;
        }

        public java.time.LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(java.time.LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getLastPaymentRecordId() {
            return lastPaymentRecordId;
        }

        public void setLastPaymentRecordId(String lastPaymentRecordId) {
            this.lastPaymentRecordId = lastPaymentRecordId;
        }
    }
}
