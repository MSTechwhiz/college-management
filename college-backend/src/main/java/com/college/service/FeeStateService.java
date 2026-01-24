package com.college.service;

import com.college.model.Fee;
import com.college.model.FeeStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Handles fee state machine transitions and validation
 * Ensures fees follow: CREATED → PENDING → PARTIAL → PAID (no skipping)
 */
@Service
public class FeeStateService {

    /**
     * Determine the correct status based on payment state
     * This is the ONLY place where status is calculated
     */
    public FeeStatus calculateStatus(double totalAmount, double paidAmount) {
        if (totalAmount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total amount must be positive");
        }

        if (paidAmount < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount cannot be negative");
        }

        if (paidAmount > totalAmount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount exceeds total amount");
        }

        // Calculate status based on payment progress
        if (paidAmount == 0) {
            return FeeStatus.PENDING;
        } else if (paidAmount < totalAmount) {
            return FeeStatus.PARTIAL;
        } else {
            return FeeStatus.PAID;
        }
    }

    /**
     * Validate and perform state transition
     * Returns true if transition is valid, throws exception otherwise
     */
    public void validateStateTransition(FeeStatus currentStatus, FeeStatus newStatus) {
        if (currentStatus == null || newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status cannot be null");
        }

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("Invalid state transition from %s to %s. Valid transitions: %s",
                            currentStatus.name(), newStatus.name(), currentStatus.getValidTransitions()));
        }
    }

    /**
     * Get derived pending amount (NEVER stored)
     */
    public double calculatePendingAmount(double totalAmount, double paidAmount) {
        return Math.max(0, totalAmount - paidAmount);
    }

    /**
     * Check if fee is in a terminal state (no more payments allowed)
     */
    public boolean isTerminalState(FeeStatus status) {
        return status == FeeStatus.PAID;
    }

    /**
     * Check if fee can accept payments
     */
    public boolean canAcceptPayments(FeeStatus status) {
        return status == FeeStatus.PENDING || status == FeeStatus.PARTIAL;
    }

    /**
     * Validate fee amount constraints
     */
    public void validateFeeAmount(double amount, String context) {
        if (amount < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    context + ": Amount cannot be negative");
        }

        if (amount == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    context + ": Amount cannot be zero");
        }

        // Check for reasonable upper bounds to prevent data corruption
        if (amount > 1_000_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    context + ": Amount exceeds maximum limit (1,000,000)");
        }
    }

    /**
     * Validate payment method
     */
    public void validatePaymentMethod(String method) {
        if (method == null || method.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method cannot be empty");
        }

        if (!isValidPaymentMethod(method)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid payment method: " + method);
        }
    }

    private boolean isValidPaymentMethod(String method) {
        return method.matches("(?i)(CASH|ONLINE|CHEQUE|BANK_TRANSFER|OTHER)");
    }

    /**
     * Validate fee type
     */
    public void validateFeeType(String feeType) {
        if (feeType == null || feeType.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee type cannot be empty");
        }

        if (!isValidFeeType(feeType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid fee type: " + feeType);
        }
    }

    private boolean isValidFeeType(String feeType) {
        return feeType.matches("(?i)(TUITION|EXAM|BUS|HOSTEL|OTHER)");
    }
}
