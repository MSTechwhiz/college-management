package com.college.service;

import com.college.model.Fee;
import com.college.model.FeeStatus;
import com.college.model.PaymentRecord;
import com.college.repository.PaymentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Manages immutable payment ledger
 * All payment transactions are recorded write-once, never modified
 * Provides complete audit trail and idempotency
 */
@Service
public class PaymentLedgerService {

    @Autowired
    private PaymentRecordRepository paymentRecordRepository;

    /**
     * Record a payment in the immutable ledger
     * Returns PaymentRecord with generated ID
     */
    public PaymentRecord recordPayment(String feeId, String studentId, String registerNumber,
            String department, double amount, String method,
            String processedBy, String idempotencyKey,
            FeeStatus oldStatus, FeeStatus newStatus,
            double balanceBefore, double balanceAfter) {

        PaymentRecord record = new PaymentRecord(feeId, studentId, amount, method);
        record.setRegisterNumber(registerNumber);
        record.setDepartment(department);
        record.setProcessedBy(processedBy);
        record.setIdempotencyKey(idempotencyKey);
        record.setPreviousStatus(oldStatus != null ? oldStatus.name() : null);
        record.setNewStatus(newStatus != null ? newStatus.name() : null);
        record.setBalanceBefore(balanceBefore);
        record.setBalanceAfter(balanceAfter);
        record.setTransactionId(UUID.randomUUID().toString());

        return paymentRecordRepository.save(record);
    }

    /**
     * Check if a payment with this idempotency key was already processed
     * Returns existing payment record if found (for idempotency)
     */
    public Optional<PaymentRecord> findByIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isEmpty()) {
            return Optional.empty();
        }
        return paymentRecordRepository.findByIdempotencyKey(idempotencyKey);
    }

    /**
     * Get complete payment history for a fee (immutable ledger)
     * Ordered by processing date, most recent first
     */
    public List<PaymentRecord> getPaymentHistory(String feeId) {
        return paymentRecordRepository.findByFeeId(feeId);
    }

    /**
     * Get all payments for a student
     */
    public List<PaymentRecord> getStudentPaymentHistory(String studentId) {
        return paymentRecordRepository.findByStudentIdOrderByProcessedAtDesc(studentId);
    }

    /**
     * Calculate total amount paid using ledger (source of truth)
     */
    public double calculateTotalPaid(String feeId) {
        return paymentRecordRepository.findByFeeId(feeId)
                .stream()
                .filter(record -> !record.isReversed())
                .mapToDouble(PaymentRecord::getAmount)
                .sum();
    }

    /**
     * Validate payment record consistency
     */
    public void validateLedgerConsistency(Fee fee, double expectedBalance) {
        double actualBalance = calculateTotalPaid(fee.getId());

        if (Math.abs(actualBalance - expectedBalance) > 0.01) { // Allow for floating point errors
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    String.format("Ledger inconsistency: Expected balance %.2f but found %.2f",
                            expectedBalance, actualBalance));
        }
    }

    /**
     * Create a reversal record (for refunds/corrections)
     * References original payment but is a separate transaction
     */
    public PaymentRecord recordReversal(PaymentRecord originalPayment, String reason, String processedBy) {
        if (originalPayment.isReversed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Payment already reversed: " + originalPayment.getId());
        }

        PaymentRecord reversalRecord = new PaymentRecord(
                originalPayment.getFeeId(),
                originalPayment.getStudentId(),
                -originalPayment.getAmount(), // Negative amount for reversal
                originalPayment.getPaymentMethod());

        reversalRecord.setRegisterNumber(originalPayment.getRegisterNumber());
        reversalRecord.setDepartment(originalPayment.getDepartment());
        reversalRecord.setProcessedBy(processedBy);
        reversalRecord.setTransactionId(UUID.randomUUID().toString());
        reversalRecord.setNotes("Reversal of " + originalPayment.getId() + ": " + reason);
        reversalRecord.setIdempotencyKey("REVERSAL_" + originalPayment.getId() + "_" + System.currentTimeMillis());

        PaymentRecord saved = paymentRecordRepository.save(reversalRecord);

        // Mark original as reversed
        originalPayment.setReversed(true);
        originalPayment.setReversalRecordId(saved.getId());
        paymentRecordRepository.save(originalPayment);

        return saved;
    }

    /**
     * Generate unique idempotency key for payment
     */
    public String generateIdempotencyKey(String feeId, double amount, String method) {
        return String.format("PAY_%s_%f_%s_%d",
                feeId, amount, method, System.currentTimeMillis());
    }
}
