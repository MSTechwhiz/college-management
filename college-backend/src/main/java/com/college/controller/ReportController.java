package com.college.controller;

import com.college.model.Report; // Assuming Report model exists
import com.college.service.ReportService; // Assuming ReportService exists
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // For current user
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports() {
        // Assuming service has getAll method
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Report>> getMyReports(Authentication authentication) {
        String username = authentication.getName(); // Assumed to be register number or username
        return ResponseEntity.ok(reportService.getReportsForUser(username));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Report> createReport(@RequestBody Report report, Authentication authentication) {
        String username = authentication.getName();
        // Assuming reportService handles linking to student/user
        return ResponseEntity.ok(reportService.createReportForUser(report, username));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> updateStatus(@PathVariable String id, @RequestBody Report statusUpdate) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, statusUpdate.getStatus()));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> assignReport(@PathVariable String id, @RequestBody Map<String, String> body) {
        String hodId = body.get("hodId");
        if (hodId == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "HOD ID is required");
        }
        return ResponseEntity.ok(reportService.assignToHOD(id, hodId));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Report> resolveReport(@PathVariable String id, @RequestBody Map<String, String> body,
            Authentication authentication) {
        String remarks = body.get("remarks");
        String resolvedBy = authentication.getName(); // Or user ID
        return ResponseEntity.ok(reportService.resolveReport(id, resolvedBy, remarks));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
