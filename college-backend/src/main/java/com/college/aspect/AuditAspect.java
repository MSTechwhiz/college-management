package com.college.aspect;

import com.college.annotation.AuditAction;
import com.college.filter.CorrelationIdFilter;
import com.college.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Central AOP aspect for audit logging
 * Intercepts methods annotated with @AuditAction
 * Extracts actor from JWT SecurityContext (not request parameters)
 * Binds correlation ID and logs all operations
 */
@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    private static final String AUDIT_EXCEPTION_ATTR = "auditException";

    /**
     * Advice to log method execution after successful return
     */
    @AfterReturning(pointcut = "@annotation(auditAction)", returning = "result")
    public void logAuditAction(JoinPoint joinPoint, AuditAction auditAction, Object result) {
        try {
            // Check if there was an exception during execution
            Exception exception = (Exception) joinPoint.getArgs()[0];
            if (exception != null) {
                return; // Exception was thrown, logged by AfterThrowing
            }
        } catch (Exception e) {
            // No exception tracking, proceed with logging
        }

        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
        String actorId = extractActorId();
        String actorRole = extractActorRole();
        String action = auditAction.action();
        String resource = auditAction.resource();
        String targetId = extractTargetId(joinPoint, auditAction);
        String ipAddress = AuditLogService.getClientIpAddress();

        auditLogService.logAuditActionWithDetails(
                actorId,
                actorRole,
                action,
                resource,
                targetId,
                ipAddress,
                correlationId,
                "SUCCESS");
    }

    /**
     * Advice to log method execution when exception is thrown
     */
    @AfterThrowing(pointcut = "@annotation(auditAction)", throwing = "exception")
    public void logAuditActionException(JoinPoint joinPoint, AuditAction auditAction, Exception exception) {
        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
        String actorId = extractActorId();
        String actorRole = extractActorRole();
        String action = auditAction.action();
        String resource = auditAction.resource();
        String targetId = extractTargetId(joinPoint, auditAction);
        String ipAddress = AuditLogService.getClientIpAddress();

        auditLogService.logAuditActionWithDetails(
                actorId,
                actorRole,
                action,
                resource,
                targetId,
                ipAddress,
                correlationId,
                "FAILED - " + exception.getMessage());
    }

    /**
     * Extract actor ID from JWT token in SecurityContext
     */
    private String extractActorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName(); // Username from JWT
        }
        return "ANONYMOUS";
    }

    /**
     * Extract actor role from JWT token in SecurityContext
     */
    private String extractActorRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .findFirst()
                    .orElse("UNKNOWN");
        }
        return "UNKNOWN";
    }

    /**
     * Extract target ID from method arguments using SpEL expression
     * Falls back to first string argument or null
     */
    private String extractTargetId(JoinPoint joinPoint, AuditAction auditAction) {
        String expression = auditAction.targetIdExpression();
        if (expression == null || expression.isEmpty()) {
            // Try to find first String argument
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof String) {
                    return (String) arg;
                }
            }
            return null;
        }

        // Simple SpEL: #id, #fee.id, #student.studentId
        if (expression.startsWith("#")) {
            String[] parts = expression.substring(1).split("\\.");
            Object current = null;

            // Find argument by name
            try {
                for (Object arg : joinPoint.getArgs()) {
                    if (arg != null && arg.getClass().getSimpleName().equalsIgnoreCase(parts[0])) {
                        current = arg;
                        break;
                    }
                }

                // Navigate nested properties
                for (int i = 1; i < parts.length && current != null; i++) {
                    java.lang.reflect.Field field = current.getClass().getDeclaredField(parts[i]);
                    field.setAccessible(true);
                    current = field.get(current);
                }

                return current != null ? current.toString() : null;
            } catch (Exception e) {
                return null;
            }
        }

        return null;
    }
}
