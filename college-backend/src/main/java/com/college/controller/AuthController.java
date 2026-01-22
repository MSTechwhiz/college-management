package com.college.controller;

import com.college.dto.DepartmentSelectRequest;
import com.college.dto.LoginRequest;
import com.college.dto.LoginResponse;
import com.college.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/select-department")
    public ResponseEntity<?> selectDepartment(@RequestBody DepartmentSelectRequest request, Authentication authentication) {
        try {
            String username = authentication.getName();
            LoginResponse response = authService.selectDepartment(username, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
