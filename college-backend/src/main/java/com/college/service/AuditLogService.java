package com.college.service;

import com.college.model.AuditLog;
import com.college.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String actorId, String actorRole, String action, String targetId, String ip) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setTargetId(targetId);
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ip);
        auditLogRepository.save(log);
    }

    /**
     * Log a login attempt (success or failure)
     */
    public void logLoginAttempt(String username, String role, boolean success, String ipAddress, String details) {
        AuditLog log = new AuditLog();
        log.setActorId(username);
        log.setActorRole(role != null ? role : "UNKNOWN");
        log.setAction(success ? "LOGIN_SUCCESS" : "LOGIN_FAILURE");
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        log.setTargetId(details != null ? details : "");
        auditLogRepository.save(log);
    }

    /**
     * Log a logout event
     */
    public void logLogout(String username, String role, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setActorId(username);
        log.setActorRole(role);
        log.setAction("LOGOUT");
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        auditLogRepository.save(log);
    }

    /**
     * Log password change
     */
    public void logPasswordChange(String username, String role, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setActorId(username);
        log.setActorRole(role);
        log.setAction("PASSWORD_CHANGED");
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        auditLogRepository.save(log);
    }

    /**
     * Log account lockout
     */
    public void logAccountLockout(String username, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setActorId(username);
        log.setAction("ACCOUNT_LOCKED");
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        auditLogRepository.save(log);
    }

    /**
     * Log generic action
     */
    public void logAction(String actorId, String actorRole, String action, String targetId, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setTargetId(targetId);
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        auditLogRepository.save(log);
    }

    /**
     * Extract client IP address from request
     */
    public static String getClientIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return "UNKNOWN";
            }
            HttpServletRequest request = attrs.getRequest();

            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }

            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }

            return request.getRemoteAddr();
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    /**
     * Log audit action with full details including correlation ID and resource type
     */
    public void logAuditActionWithDetails(String actorId, String actorRole, String action,
            String resource, String targetId, String ipAddress,
            String correlationId, String details) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setResourceType(resource);
        log.setTargetId(targetId);
        log.setTimestamp(LocalDateTime.now());
        log.setIp(ipAddress);
        log.setCorrelationId(correlationId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
