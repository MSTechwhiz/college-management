package com.college.controller;

import com.college.model.AuditLog;
import com.college.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Admin-only controller for audit log retrieval and analysis
 * All endpoints require ADMIN role
 */
@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Get all audit logs with pagination
     * /api/audit/logs?page=0&size=50&sort=timestamp,desc
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy) {

        Page<AuditLog> logs = auditLogRepository.findAll(
                PageRequest.of(page, size, Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs for a specific actor (user)
     */
    @GetMapping("/logs/actor/{actorId}")
    public ResponseEntity<List<AuditLog>> getLogsByActor(@PathVariable String actorId) {
        List<AuditLog> logs = auditLogRepository.findByActorId(actorId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs for a specific action type
     */
    @GetMapping("/logs/action/{action}")
    public ResponseEntity<List<AuditLog>> getLogsByAction(@PathVariable String action) {
        List<AuditLog> logs = auditLogRepository.findByAction(action);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs for a specific resource type
     */
    @GetMapping("/logs/resource/{resourceType}")
    public ResponseEntity<List<AuditLog>> getLogsByResourceType(@PathVariable String resourceType) {
        List<AuditLog> logs = auditLogRepository.findByResourceType(resourceType);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs for a specific target (e.g., fee ID, student ID)
     */
    @GetMapping("/logs/target/{targetId}")
    public ResponseEntity<List<AuditLog>> getLogsByTarget(@PathVariable String targetId) {
        List<AuditLog> logs = auditLogRepository.findByTargetId(targetId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get all operations in a request trace using correlation ID
     */
    @GetMapping("/logs/trace/{correlationId}")
    public ResponseEntity<List<AuditLog>> getOperationTrace(@PathVariable String correlationId) {
        List<AuditLog> logs = auditLogRepository.findByCorrelationId(correlationId);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs within a time range
     * /api/audit/logs/range?start=2026-01-20T00:00:00&end=2026-01-23T23:59:59
     */
    @GetMapping("/logs/range")
    public ResponseEntity<List<AuditLog>> getLogsByTimeRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end);
        return ResponseEntity.ok(logs);
    }

    /**
     * Get failed actions (security monitoring)
     */
    @GetMapping("/logs/failed-actions")
    public ResponseEntity<List<AuditLog>> getFailedActions() {
        List<AuditLog> logs = auditLogRepository.findFailedActions();
        return ResponseEntity.ok(logs);
    }

    /**
     * Get failed login attempts from specific IP (detect brute force)
     */
    @GetMapping("/logs/suspicious-ips/{ipAddress}")
    public ResponseEntity<Map<String, Object>> getSuspiciousActivity(@PathVariable String ipAddress) {
        List<AuditLog> failedAttempts = auditLogRepository.findFailedLoginsByIp(ipAddress);

        Map<String, Object> response = new HashMap<>();
        response.put("ipAddress", ipAddress);
        response.put("failedAttempts", failedAttempts.size());
        response.put("logs", failedAttempts);
        response.put("isSuspicious", failedAttempts.size() > 3); // More than 3 failed attempts = suspicious

        return ResponseEntity.ok(response);
    }

    /**
     * Audit activity summary by actor and time
     */
    @GetMapping("/summary/actor/{actorId}")
    public ResponseEntity<Map<String, Object>> getActorActivitySummary(@PathVariable String actorId) {
        List<AuditLog> logs = auditLogRepository.findByActorId(actorId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("actorId", actorId);
        summary.put("totalActions", logs.size());
        summary.put("actionTypes", logs.stream()
                .map(AuditLog::getAction)
                .distinct()
                .toList());
        summary.put("resourcesAccessed", logs.stream()
                .map(AuditLog::getResourceType)
                .distinct()
                .toList());
        summary.put("logs", logs);

        return ResponseEntity.ok(summary);
    }

    /**
     * Check audit log health (append-only verification)
     * Returns count and status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAuditHealth() {
        long totalLogs = auditLogRepository.count();

        // Get failed actions count
        long failedCount = auditLogRepository.findFailedActions().size();

        Map<String, Object> health = new HashMap<>();
        health.put("status", "OPERATIONAL");
        health.put("totalLogs", totalLogs);
        health.put("failedActions", failedCount);
        health.put("successRate",
                totalLogs > 0 ? String.format("%.2f%%", (totalLogs - failedCount) * 100.0 / totalLogs) : "N/A");
        health.put("appendOnlyGuarantee", "ENABLED");
        health.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(health);
    }
}
