package com.college.controller;

import com.college.model.Department;
import com.college.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.college.service.AuditLogService;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/dropdown")
    public ResponseEntity<List<Department>> getDepartmentsDropdown() {
        return ResponseEntity.ok(departmentService.getActiveDepartmentsForDropdown());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getDepartmentsWithCounts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDepartmentDetail(@PathVariable String id) {
        return ResponseEntity.ok(departmentService.getDepartmentDetail(id));
    }

    @PutMapping("/{id}/hod")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignHod(@PathVariable String id, @RequestBody Map<String, String> body,
            Authentication authentication) {
        String facultyId = body.get("facultyId");
        if (facultyId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Faculty ID is required");
        }
        departmentService.assignHod(id, facultyId);

        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "ASSIGN_HOD", id, "Faculty: " + facultyId);

        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody Department department,
            Authentication authentication) {
        Department created = departmentService.createDepartment(department);

        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "CREATE_DEPARTMENT", created.getId(),
                "Name: " + created.getName());

        return ResponseEntity.ok(created);
    }
}
