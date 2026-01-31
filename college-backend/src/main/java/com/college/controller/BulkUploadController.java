package com.college.controller;

import com.college.service.BulkUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bulk")
@CrossOrigin(origins = "http://localhost:3000")
public class BulkUploadController {

    @Autowired
    private BulkUploadService bulkUploadService;

    @PostMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadStudents(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            List<String> errors = bulkUploadService.uploadStudents(file);

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Validation failed",
                        "errors", errors));
            }

            return ResponseEntity.ok(Map.of("message", "Bulk upload successful"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}
