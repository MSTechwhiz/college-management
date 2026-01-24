package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "fees")
@CompoundIndex(def = "{'studentId':1, 'year':1, 'semester':1, 'feeType':1}")
@CompoundIndex(def = "{'registerNumber':1, 'department':1, 'semester':1}")
public class Fee {
    @Id
    private String id;

    private String studentId;
    private String registerNumber;
    private String department;
    private int year;
    private int semester;
    private double totalAmount;
    private double paidAmount;
    private double pendingAmount;
    private String status; // PENDING, PARTIAL, PAID
    private List<FeeOverride> overrides;
    private List<Payment> payments;

    private String feeType; // Tuition, Exam, Bus, Hostel, Other
    private java.util.Map<String, Double> breakdown;
    private java.time.LocalDateTime dueDate;
    private java.time.LocalDateTime createdDate;

    // Idempotency and concurrency safety
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
}
