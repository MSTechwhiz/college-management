package com.college.controller;

import com.college.model.Report;
import com.college.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createReport(@RequestBody Report report, Authentication authentication) {
        try {
            // This would need to be fetched from user/student relationship
            // For now, assuming studentId is passed or extracted
            return ResponseEntity.ok(reportService.createReport(report, report.getStudentId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Report>> getReportsByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(reportService.getReportsByStudent(studentId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getReportsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status));
    }

    @PostMapping("/{reportId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignToHOD(@PathVariable String reportId, @RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(reportService.assignToHOD(reportId, request.get("hodId")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<?> resolveReport(@PathVariable String reportId, @RequestBody Map<String, String> request, Authentication authentication) {
        try {
            return ResponseEntity.ok(reportService.resolveReport(reportId, authentication.getName(), request.get("remarks")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
