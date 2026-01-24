package com.college.repository;

import com.college.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    /**
     * Find audit logs by actor ID (username)
     */
    List<AuditLog> findByActorId(String actorId);

    /**
     * Find audit logs by action type
     */
    List<AuditLog> findByAction(String action);

    /**
     * Find audit logs by resource type
     */
    List<AuditLog> findByResourceType(String resourceType);

    /**
     * Find audit logs by target ID
     */
    List<AuditLog> findByTargetId(String targetId);

    /**
     * Find audit logs by correlation ID (trace related operations)
     */
    List<AuditLog> findByCorrelationId(String correlationId);

    /**
     * Find audit logs within a time range
     */
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Paginated query for admin viewing
     */
    Page<AuditLog> findAll(Pageable pageable);

    /**
     * Find audit logs by actor and action
     */
    List<AuditLog> findByActorIdAndAction(String actorId, String action);

    /**
     * Find all failed actions (for security monitoring)
     */
    @Query("{ 'details' : { $regex: 'FAILED', $options: 'i' } }")
    List<AuditLog> findFailedActions();

    /**
     * Find suspicious activity: multiple failed attempts from same IP
     */
    @Query("{ 'action' : 'LOGIN_FAILURE', 'ip' : ?0 }")
    List<AuditLog> findFailedLoginsByIp(String ipAddress);
}
