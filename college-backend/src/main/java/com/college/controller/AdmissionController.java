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
@PreAuthorize("hasRole('ADMIN')")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;
    @Autowired
    private AuditLogService auditLogService;

    @PostMapping
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
    public ResponseEntity<List<Admission>> getAllAdmissions() {
        return ResponseEntity.ok(admissionService.getAllAdmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admission> getAdmissionById(@PathVariable String id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Admission>> getAdmissionsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(admissionService.getAdmissionsByDepartment(department));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Map<String, Long>>> getDepartmentStatistics() {
        return ResponseEntity.ok(admissionService.getDepartmentStatistics());
    }

    @PutMapping("/{id}")
    @AuditAction(action = "UPDATE_ADMISSION", resource = "Admission", targetIdExpression = "#id")
    public ResponseEntity<Admission> updateAdmission(@PathVariable String id, @RequestBody Admission admission,
            Authentication authentication) {
        Admission updated = admissionService.updateAdmission(id, admission);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "UPDATE_ADMISSION", id, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @AuditAction(action = "DELETE_ADMISSION", resource = "Admission", targetIdExpression = "#id")
    public ResponseEntity<?> deleteAdmission(@PathVariable String id, Authentication authentication) {
        admissionService.deleteAdmission(id);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DELETE_ADMISSION", id, null);
        return ResponseEntity.ok().build();
    }
}
