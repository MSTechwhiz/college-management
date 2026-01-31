package com.college.controller;

import com.college.model.GPA;
import com.college.service.GPAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gpa")
@CrossOrigin(origins = "*")
public class GPAController {

    @Autowired
    private GPAService gpaService;

    @PostMapping("/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<GPA> calculateGPA(
            @RequestParam String studentId,
            @RequestParam int semester) {
        GPA gpa = gpaService.calculateAndSaveGPA(studentId, semester);
        return ResponseEntity.ok(gpa);
    }

    @GetMapping("/student/{studentId}/semester/{semester}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'PRINCIPAL')")
    public ResponseEntity<GPA> getStudentGPA(
            @PathVariable String studentId,
            @PathVariable int semester) {
        GPA gpa = gpaService.getStudentGPA(studentId, semester);
        return ResponseEntity.ok(gpa);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'PRINCIPAL')")
    public ResponseEntity<List<GPA>> getAllStudentGPAs(@PathVariable String studentId) {
        List<GPA> gpas = gpaService.getAllStudentGPAs(studentId);
        return ResponseEntity.ok(gpas);
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<GPA> finalizeGPA(
            @RequestParam String studentId,
            @RequestParam int semester) {
        GPA gpa = gpaService.finalizeGPA(studentId, semester);
        return ResponseEntity.ok(gpa);
    }
}
