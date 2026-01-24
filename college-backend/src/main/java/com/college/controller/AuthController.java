package com.college.controller;

import com.college.dto.DepartmentSelectRequest;
import com.college.dto.LoginRequest;
import com.college.dto.LoginResponse;
import com.college.service.AuthService;
import com.college.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body, Authentication authentication) {
        try {
            String username = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .orElse("UNKNOWN");
            String refreshToken = body.get("refreshToken");

            authService.logout(username, role, refreshToken);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/select-department")
    public ResponseEntity<?> selectDepartment(@RequestBody DepartmentSelectRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            LoginResponse response = authService.selectDepartment(username, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        try {
            String refreshToken = body.get("refreshToken");
            LoginResponse response = authService.refresh(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            if (username == null || username.isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }

            String resetToken = passwordResetService.initiatePasswordReset(username);
            // In production, don't return token - only send via email
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset email sent if user exists",
                    "resetToken", resetToken // For testing/demo only
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/confirm-password-reset")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> body) {
        try {
            String resetToken = body.get("resetToken");
            String newPassword = body.get("newPassword");

            if (resetToken == null || resetToken.isEmpty()) {
                return ResponseEntity.badRequest().body("Reset token is required");
            }
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body("New password is required");
            }

            passwordResetService.confirmPasswordReset(resetToken, newPassword);
            return ResponseEntity
                    .ok(Map.of("message", "Password reset successful. Please login with your new password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            boolean isValid = passwordResetService.isResetTokenValid(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }
}
