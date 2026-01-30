package com.college.controller;

import com.college.annotation.AuditAction;
import com.college.model.Faculty;
import com.college.service.AuditLogService;
import com.college.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3000")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Faculty>> getAllFaculty() {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Faculty> getFacultyById(@PathVariable String id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "CREATE_FACULTY", resource = "Faculty")
    public ResponseEntity<Faculty> createFaculty(@Valid @RequestBody Faculty faculty, Authentication authentication) {
        Faculty created = facultyService.createFaculty(faculty);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "CREATE_FACULTY", created.getId(), "Faculty ID: " + created.getFacultyId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "UPDATE_FACULTY", resource = "Faculty", targetIdExpression = "#id")
    public ResponseEntity<Faculty> updateFaculty(@PathVariable String id, @Valid @RequestBody Faculty faculty, Authentication authentication) {
        Faculty updated = facultyService.updateFaculty(id, faculty);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "UPDATE_FACULTY", id, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "DELETE_FACULTY", resource = "Faculty", targetIdExpression = "#id")
    public ResponseEntity<Void> deleteFaculty(@PathVariable String id, Authentication authentication) {
        facultyService.deleteFaculty(id);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DELETE_FACULTY", id, null);
        return ResponseEntity.ok().build();
    }
}
