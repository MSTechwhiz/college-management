package com.college.controller;

import com.college.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

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
}
