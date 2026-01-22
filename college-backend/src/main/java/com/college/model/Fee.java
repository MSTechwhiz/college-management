package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "fees")
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
    private List<FeeOverride> overrides;

    public Fee() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(double paidAmount) { this.paidAmount = paidAmount; }

    public double getPendingAmount() { return pendingAmount; }
    public void setPendingAmount(double pendingAmount) { this.pendingAmount = pendingAmount; }

    public List<FeeOverride> getOverrides() { return overrides; }
    public void setOverrides(List<FeeOverride> overrides) { this.overrides = overrides; }

    public static class FeeOverride {
        private double amount;
        private String reason;
        private String adminId;
        private String timestamp;

        public FeeOverride() {}

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getAdminId() { return adminId; }
        public void setAdminId(String adminId) { this.adminId = adminId; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
}
