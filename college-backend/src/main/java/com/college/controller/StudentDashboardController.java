package com.college.controller;

import com.college.security.JwtUtil;
import com.college.service.StudentDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('STUDENT')")
public class StudentDashboardController {

    @Autowired
    private StudentDashboardService studentDashboardService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestHeader("Authorization") String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        // Assuming username is register number for students
        return ResponseEntity.ok(studentDashboardService.getStudentDashboard(username));
    }
}
