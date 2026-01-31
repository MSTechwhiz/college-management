package com.college.controller;

import com.college.model.Subject;
import com.college.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody Subject subject) {
        Subject created = subjectService.createSubject(subject);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<Subject> getSubjectById(@PathVariable String id) {
        Subject subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(subject);
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<Subject> getSubjectByCode(@PathVariable String code) {
        Subject subject = subjectService.getSubjectByCode(code);
        return ResponseEntity.ok(subject);
    }

    @GetMapping("/department/{department}/semester/{semester}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<List<Subject>> getSubjectsByDepartmentAndSemester(
            @PathVariable String department,
            @PathVariable int semester) {
        List<Subject> subjects = subjectService.getSubjectsByDepartmentAndSemester(department, semester);
        return ResponseEntity.ok(subjects);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Subject> updateSubject(
            @PathVariable String id,
            @RequestBody Subject subject) {
        Subject updated = subjectService.updateSubject(id, subject);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<Void> deleteSubject(@PathVariable String id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }
}
