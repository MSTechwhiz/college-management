package com.college.controller;

import com.college.annotation.AuditAction;
import com.college.model.Admission;
import com.college.service.AdmissionService;
import com.college.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admissions")
@CrossOrigin(origins = "http://localhost:3000")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;
    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "CREATE_ADMISSION", resource = "Admission")
    public ResponseEntity<Admission> createAdmission(@Valid @RequestBody Admission admission,
            Authentication authentication) {
        Admission created = admissionService.createAdmission(admission);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "CREATE_ADMISSION", created.getId(), null);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admission> getAdmissionById(@PathVariable String id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Admission>> getAdmissionsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(admissionService.getAdmissionsByDepartment(department));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Map<String, Long>>> getDepartmentStatistics() {
        return ResponseEntity.ok(admissionService.getDepartmentStatistics());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "UPDATE_ADMISSION", resource = "Admission", targetIdExpression = "#id")
    public ResponseEntity<Admission> updateAdmission(@PathVariable String id, @Valid @RequestBody Admission admission,
            Authentication authentication) {
        Admission updated = admissionService.updateAdmission(id, admission);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "UPDATE_ADMISSION", id, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "DELETE_ADMISSION", resource = "Admission", targetIdExpression = "#id")
    public ResponseEntity<Admission> deleteAdmission(@PathVariable String id, Authentication authentication) {
        Admission deleted = admissionService.deleteAdmissionAndReturn(id);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DELETE_ADMISSION", id, null);
        return ResponseEntity.ok(deleted);
    }

}
