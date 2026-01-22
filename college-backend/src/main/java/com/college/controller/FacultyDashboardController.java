package com.college.controller;

import com.college.model.Student;
import com.college.security.JwtUtil;
import com.college.service.FacultyDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyDashboardController {

    @Autowired
    private FacultyDashboardService facultyDashboardService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestHeader("Authorization") String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        return ResponseEntity.ok(facultyDashboardService.getFacultyDashboard(username));
    }

    @GetMapping("/students/{year}")
    public ResponseEntity<List<Student>> getStudentsByYear(@PathVariable int year, @RequestHeader("Authorization") String token) {
        String department = jwtUtil.extractDepartment(token.substring(7));
        return ResponseEntity.ok(facultyDashboardService.getStudentsByYear(department, year));
    }
}
