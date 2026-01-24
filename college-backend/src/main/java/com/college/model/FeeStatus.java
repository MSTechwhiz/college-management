package com.college.model;

import java.util.EnumSet;
import java.util.Set;

/**
 * Fee lifecycle state machine
 * Transitions: CREATED → PENDING → PARTIAL → PAID (no skipping allowed)
 */
public enum FeeStatus {
    CREATED("Created", "Initial state"),
    PENDING("Pending", "Fee generated, no payments"),
    PARTIAL("Partial", "Some payment received"),
    PAID("Paid", "Full payment received");

    private final String displayName;
    private final String description;

    FeeStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get valid next states for current status
     */
    public Set<FeeStatus> getValidTransitions() {
        return switch (this) {
            case CREATED -> EnumSet.of(PENDING);
            case PENDING -> EnumSet.of(PARTIAL, PAID);
            case PARTIAL -> EnumSet.of(PAID);
            case PAID -> EnumSet.noneOf(FeeStatus.class);
        };
    }

    /**
     * Check if transition is valid
     */
    public boolean canTransitionTo(FeeStatus nextStatus) {
        if (nextStatus == null)
            return false;
        return getValidTransitions().contains(nextStatus);
    }

    /**
     * Get status from string (legacy compatibility)
     */
    public static FeeStatus fromLegacyString(String status) {
        if (status == null)
            return CREATED;
        return switch (status.toUpperCase()) {
            case "PENDING" -> PENDING;
            case "PARTIAL" -> PARTIAL;
            case "PAID" -> PAID;
            default -> CREATED;
        };
    }

    /**
     * Convert to legacy string format
     */
    public String toLegacyString() {
        return name();
    }
}
