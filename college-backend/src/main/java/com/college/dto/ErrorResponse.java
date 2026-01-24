package com.college.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/**
 * Standardized error response for all API endpoints.
 * Ensures consistent error format across the application with no sensitive
 * data.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private String message;
    private String field;
    private String timestamp;
    private String path;
    private Integer statusCode;

    public ErrorResponse(String message, String field, String path, Integer statusCode) {
        this.message = message;
        this.field = field;
        this.path = path;
        this.statusCode = statusCode;
        this.timestamp = Instant.now().toString();
    }

    public ErrorResponse(String message, String path, Integer statusCode) {
        this(message, null, path, statusCode);
    }

    public ErrorResponse(String message, Integer statusCode) {
        this(message, null, null, statusCode);
    }

    // Getters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }
}
