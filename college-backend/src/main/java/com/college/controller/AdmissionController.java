package com.college.controller;

import com.college.model.Admission;
import com.college.service.AdmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admissions")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;

    @PostMapping
    public ResponseEntity<Admission> createAdmission(@RequestBody Admission admission) {
        return ResponseEntity.ok(admissionService.createAdmission(admission));
    }

    @GetMapping
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Admission>> getAdmissionsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(admissionService.getAdmissionsByDepartment(department));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getDepartmentStatistics() {
        return ResponseEntity.ok(admissionService.getDepartmentStatistics());
    }
}
