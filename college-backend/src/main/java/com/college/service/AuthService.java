package com.college.service;

import com.college.dto.DepartmentSelectRequest;
import com.college.dto.LoginRequest;
import com.college.dto.LoginResponse;
import com.college.model.User;
import com.college.repository.UserRepository;
import com.college.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.college.model.RefreshToken;
import com.college.repository.RefreshTokenRepository;
import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private TokenRevocationService tokenRevocationService;

    @Autowired
    private com.college.repository.StudentRepository studentRepository;

    @Autowired
    private com.college.repository.FacultyRepository facultyRepository;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Defensive null checks
        if (request == null || request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        String ipAddress = AuditLogService.getClientIpAddress();
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    auditLogService.logLoginAttempt(request.getUsername(), request.getRole(), false, ipAddress,
                            "User not found");
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });

        // Check if account is temporarily locked
        if (user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                    "Account temporarily locked");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account temporarily locked. Try again later.");
        }

        // Unlock if lockout period has expired
        if (user.isLocked() && user.getLockedUntil() != null && user.getLockedUntil().isBefore(LocalDateTime.now())) {
            user.setLocked(false);
            user.setFailedAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }

        if (!user.getRole().equals(request.getRole())) {
            auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress, "Invalid role");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid role");
        }

        boolean passwordOk = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordOk) {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLocked(true);
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
                auditLogService.logAccountLockout(user.getUsername(), ipAddress);
            }
            userRepository.save(user);
            auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                    "Invalid password. Attempts: " + attempts);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!user.isActive()) {
            auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress, "Account inactive");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        if ("ADMIN".equals(user.getRole())) {
            String rawPassword = request.getPassword();
            if (rawPassword.length() < 8
                    || !rawPassword.matches(".*[A-Z].*")
                    || !rawPassword.matches(".*[a-z].*")
                    || !rawPassword.matches(".*\\d.*")) {
                auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                        "Password doesn't meet policy");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password does not meet policy requirements");
            }
        } else if ("STUDENT".equals(user.getRole()) || "FACULTY".equals(user.getRole())) {
            String dob = request.getPassword();
            if (!dob.matches("^\\d{2}/\\d{2}/\\d{4}$")) {
                auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                        "DOB format invalid");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date of birth must be in DD/MM/YYYY format");
            }
            if ("STUDENT".equals(user.getRole())) {
                java.util.Optional<com.college.model.Student> sOpt = studentRepository.findByUserId(user.getId());
                if (sOpt.isEmpty() || sOpt.get().getDateOfBirth() == null || !dob.equals(sOpt.get().getDateOfBirth())) {
                if (sOpt.isEmpty() || sOpt.get().getDateOfBirth() == null || !dob.equals(sOpt.get().getDateOfBirth())) {
                    auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                            "DOB mismatch");
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                }
                java.util.Optional<com.college.model.Faculty> fOpt = facultyRepository.findByUserId(user.getId());
                if (fOpt.isEmpty() || fOpt.get().getDateOfBirth() == null || !dob.equals(fOpt.get().getDateOfBirth())) {
                fOpt = fr.findByUserId(user.getId());
                if (fOpt.isEmpty() || fOpt.get().getDateOfBirth() == null || !dob.equals(fOpt.get().getDateOfBirth())) {
                    auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), false, ipAddress,
                            "DOB mismatch");
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                }

        // Reset failed attempts on successful login
        user.setFailedAttempts(0);
        user.setLocked(false);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Audit log successful login
        auditLogService.logLoginAttempt(user.getUsername(), user.getRole(), true, ipAddress, "");

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getDepartment());
        RefreshToken rt = new RefreshToken();
        rt.setUsername(user.getUsername());
        rt.setToken(java.util.UUID.randomUUID().toString());
        rt.setExpiry(LocalDateTime.now().plusDays(7));
        rt.setRevoked(false);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRefreshToken(rt.getToken());
        response.setRole(user.getRole());
        response.setUsername(user.getUsername());
        response.setDepartment(user.getDepartment());
        response.setDepartments(user.getDepartments());

        return response;
    }

    public LoginResponse refresh(String refreshToken) {
        String ipAddress = AuditLogService.getClientIpAddress();
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        // Check if token is revoked
        if (rt.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (rt.getExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = userRepository.findByUsername(rt.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Generate new access token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getDepartment());

        // Token rotation: create new refresh token and revoke old one
        rt.setRevoked(true);
        rt.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(rt);

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setUsername(user.getUsername());
        newRefreshToken.setToken(java.util.UUID.randomUUID().toString());
        newRefreshToken.setExpiry(LocalDateTime.now().plusDays(7));
        newRefreshToken.setRevoked(false);
        refreshTokenRepository.save(newRefreshToken);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRefreshToken(newRefreshToken.getToken());
        response.setRole(user.getRole());
        response.setUsername(user.getUsername());
        response.setDepartment(user.getDepartment());
        response.setDepartments(user.getDepartments());
        return response;
    }

    public void logout(String username, String role, String refreshToken) {
        String ipAddress = AuditLogService.getClientIpAddress();

        // Revoke the refresh token
        if (refreshToken != null && !refreshToken.isEmpty()) {
            tokenRevocationService.revokeToken(refreshToken);
        }

        // Log the logout event
        auditLogService.logLogout(username, role, ipAddress);
    }

    public LoginResponse selectDepartment(String username, DepartmentSelectRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getDepartments() != null && !user.getDepartments().contains(request.getDepartment())) {
            throw new RuntimeException("Department not assigned to user");
        }

        user.setDepartment(request.getDepartment());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getDepartment());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(user.getRole());
        response.setUsername(user.getUsername());
        response.setDepartment(user.getDepartment());
        response.setDepartments(user.getDepartments());

        return response;
    }
}
