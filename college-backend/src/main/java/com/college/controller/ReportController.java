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
    public ResponseEntity<Report> createReport(@RequestBody Report report, Authentication authentication) {
        return ResponseEntity.ok(reportService.createReportForUser(report, authentication.getName()));
    }

    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Report>> getMyReports(Authentication authentication) {
        return ResponseEntity.ok(reportService.getReportsForUser(authentication.getName()));
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
    public ResponseEntity<Report> assignToHOD(@PathVariable String reportId, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(reportService.assignToHOD(reportId, request.get("hodId")));
    }

    @PostMapping("/{reportId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Report> resolveReport(@PathVariable String reportId, @RequestBody Map<String, String> request,
            Authentication authentication) {
        return ResponseEntity
                .ok(reportService.resolveReport(reportId, authentication.getName(), request.get("remarks")));
    }
}
