package com.college.service;

import com.college.model.RefreshToken;
import com.college.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TokenRevocationService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    /**
     * Revoke a specific refresh token (logout)
     */
    public void revokeToken(String token) {
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        if (rt.isPresent()) {
            RefreshToken refreshToken = rt.get();
            refreshToken.setRevoked(true);
            refreshToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(refreshToken);
        }
    }

    /**
     * Revoke all refresh tokens for a user (password change, account lockout, etc.)
     */
    public void revokeAllTokensForUser(String username) {
        refreshTokenRepository.findAll().stream()
                .filter(rt -> rt.getUsername().equals(username) && !rt.isRevoked())
                .forEach(rt -> {
                    rt.setRevoked(true);
                    rt.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(rt);
                });
    }

    /**
     * Check if a token has been revoked
     */
    public boolean isTokenRevoked(String token) {
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        if (rt.isPresent()) {
            return rt.get().isRevoked();
        }
        return false;
    }

    /**
     * Check if a token is valid (not revoked and not expired)
     */
    public boolean isTokenValid(String token) {
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        if (rt.isEmpty()) {
            return false;
        }

        RefreshToken refreshToken = rt.get();
        return !refreshToken.isRevoked() &&
                refreshToken.getExpiry().isAfter(LocalDateTime.now());
    }
}
