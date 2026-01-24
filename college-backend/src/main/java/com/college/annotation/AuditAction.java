package com.college.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method for centralized audit logging via AOP
 * Actor is extracted from JWT, not request parameters
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditAction {
    /**
     * Action name (e.g., "CREATE_FEE", "UPDATE_STUDENT", "PROCESS_ADMISSION")
     */
    String action();

    /**
     * Resource type being acted upon (e.g., "Fee", "Student", "Admission")
     */
    String resource() default "";

    /**
     * SpEL expression to extract target ID from method args
     * Examples: "#id", "#fee.id", "#student.studentId"
     */
    String targetIdExpression() default "";

    /**
     * Whether to log on success only (true) or all calls (false)
     */
    boolean successOnly() default false;
}
