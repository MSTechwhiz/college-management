package com.college.controller;

import com.college.model.AcademicYear;
import com.college.model.Batch;
import com.college.service.AcademicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "http://localhost:3000") // Adjust as needed
public class AcademicController {

    @Autowired
    private AcademicService academicService;

    @GetMapping("/years")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'FACULTY')")
    public List<AcademicYear> getAllYears() {
        return academicService.getAllYears();
    }

    @PostMapping("/years")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicYear> createYear(@RequestBody AcademicYear year) {
        return ResponseEntity.ok(academicService.createYear(year));
    }

    @GetMapping("/current-year")
    public ResponseEntity<AcademicYear> getCurrentYear() {
        return ResponseEntity.ok(academicService.getCurrentYear());
    }

    @GetMapping("/batches/{yearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'FACULTY')")
    public List<Batch> getBatchesByYear(@PathVariable String yearId) {
        return academicService.getBatchesByYear(yearId);
    }

    @PostMapping("/batches")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Batch> createBatch(@RequestBody Batch batch) {
        return ResponseEntity.ok(academicService.createBatch(batch));
    }
}
