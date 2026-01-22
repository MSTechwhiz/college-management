package com.college.controller;

import com.college.model.Faculty;
import com.college.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3000")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Faculty>> getAllFaculty() {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Faculty> getFacultyById(@PathVariable String id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFaculty(@RequestBody Faculty faculty) {
        try {
            return ResponseEntity.ok(facultyService.createFaculty(faculty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFaculty(@PathVariable String id, @RequestBody Faculty faculty) {
        try {
            return ResponseEntity.ok(facultyService.updateFaculty(id, faculty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFaculty(@PathVariable String id) {
        try {
            facultyService.deleteFaculty(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/promote-hod")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteToHOD(@PathVariable String id) {
        try {
            return ResponseEntity.ok(facultyService.promoteToHOD(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
