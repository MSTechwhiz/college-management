package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Immutable payment ledger record - Write-once, never modified
 * Provides complete audit trail of all payment transactions
 */
@Document(collection = "payment_ledger")
public class PaymentRecord {
    @Id
    private String id;

    @Indexed
    private String feeId;
    @Indexed
    private String studentId;
    @Indexed
    private String registerNumber;
    @Indexed
    private String department;

    // Payment details
    private double amount;
    private String paymentMethod; // CASH, ONLINE, CHEQUE, etc.
    private String transactionId;

    // State tracking
    private String previousStatus;
    private String newStatus;

    // Audit trail
    private String processedBy; // admin ID or system
    @Indexed
    private LocalDateTime processedAt;
    private String idempotencyKey;

    // Validation
    private double balanceBefore;
    private double balanceAfter;
    private boolean isReversed = false;
    private String reversalRecordId; // if this payment was reversed, link to reversal record
    private Integer installmentIndex;

    // Metadata
    private String notes;

    public PaymentRecord() {
    }

    public PaymentRecord(String feeId, String studentId, double amount, String method) {
        this.feeId = feeId;
        this.studentId = studentId;
        this.amount = amount;
        this.paymentMethod = method;
        this.processedAt = LocalDateTime.now();
    }

    // Getters only - no setters for critical fields (write-once semantics)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFeeId() {
        return feeId;
    }

    public String getStudentId() {
        return studentId;
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

    public double getAmount() {
        return amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public double getBalanceBefore() {
        return balanceBefore;
    }

    public void setBalanceBefore(double balanceBefore) {
        this.balanceBefore = balanceBefore;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public boolean isReversed() {
        return isReversed;
    }

    public void setReversed(boolean reversed) {
        isReversed = reversed;
    }

    public String getReversalRecordId() {
        return reversalRecordId;
    }

    public void setReversalRecordId(String reversalRecordId) {
        this.reversalRecordId = reversalRecordId;
    }

    public String getNotes() {
        return notes;
    }

    public Integer getInstallmentIndex() {
        return installmentIndex;
    }

    public void setInstallmentIndex(Integer installmentIndex) {
        this.installmentIndex = installmentIndex;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
