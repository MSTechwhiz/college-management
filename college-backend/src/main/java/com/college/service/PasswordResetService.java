package com.college.service;

import com.college.model.PasswordReset;
import com.college.model.User;
import com.college.repository.PasswordResetRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private TokenRevocationService tokenRevocationService;

    /**
     * Initiate password reset for user (generates reset token)
     * In production, this would send an email with the reset token
     */
    public String initiatePasswordReset(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Invalidate previous reset tokens
        passwordResetRepository.deleteByUsernameAndUsedTrue(username);

        // Check for existing unused reset token
        var existingReset = passwordResetRepository.findByUsernameAndUsedFalse(username);
        if (existingReset.isPresent()) {
            PasswordReset pr = existingReset.get();
            if (pr.getExpiryTime().isAfter(LocalDateTime.now())) {
                // Token still valid, return it
                return pr.getResetToken();
            } else {
                // Token expired, delete it
                passwordResetRepository.delete(pr);
            }
        }

        // Create new reset token (valid for 1 hour)
        String resetToken = UUID.randomUUID().toString();
        PasswordReset pr = new PasswordReset(
                username,
                resetToken,
                LocalDateTime.now().plusHours(1));
        passwordResetRepository.save(pr);

        // In production, send email here:
        // emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        // For now, we log it
        auditLogService.logAction(username, user.getRole(), "PASSWORD_RESET_INITIATED", "",
                AuditLogService.getClientIpAddress());

        return resetToken; // In production, don't return this - only send via email
    }

    /**
     * Confirm password reset with new password
     */
    public void confirmPasswordReset(String resetToken, String newPassword) {
        String ipAddress = AuditLogService.getClientIpAddress();

        PasswordReset pr = passwordResetRepository.findByResetToken(resetToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token"));

        if (pr.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token already used");
        }

        if (pr.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token expired");
        }

        // Validate password policy
        if (newPassword.length() < 8
                || !newPassword.matches(".*[A-Z].*")
                || !newPassword.matches(".*[a-z].*")
                || !newPassword.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password does not meet policy requirements");
        }

        User user = userRepository.findByUsername(pr.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLastPasswordChange(LocalDateTime.now());
        userRepository.save(user);

        // Mark reset token as used
        pr.setUsed(true);
        pr.setUsedAt(LocalDateTime.now());
        passwordResetRepository.save(pr);

        // Revoke all existing refresh tokens for security (force re-login with new
        // password)
        tokenRevocationService.revokeAllTokensForUser(user.getUsername());

        // Audit log
        auditLogService.logPasswordChange(user.getUsername(), user.getRole(), ipAddress);
    }

    /**
     * Validate if reset token is still valid
     */
    public boolean isResetTokenValid(String resetToken) {
        var pr = passwordResetRepository.findByResetToken(resetToken);
        if (pr.isEmpty()) {
            return false;
        }

        PasswordReset reset = pr.get();
        return !reset.isUsed() && reset.getExpiryTime().isAfter(LocalDateTime.now());
    }
}
