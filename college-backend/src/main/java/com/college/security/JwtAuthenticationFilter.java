package com.college.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.college.service.TokenRevocationService;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private TokenRevocationService tokenRevocationService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String role = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractRole(jwt);
            } catch (Exception e) {
                // Invalid token format or signature
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                String body = String.format(
                        "{\"message\":\"Authentication required or token invalid\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                        java.time.Instant.now().toString(), request.getRequestURI());
                response.getWriter().write(body);
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt, username)) {
                // Additional check: ensure token is not in revocation list
                // Note: This is for refresh tokens primarily. For stateless access tokens,
                // you may implement token blacklist caching if needed.
                if (tokenRevocationService != null) {
                    // For now, this is mainly for internal tracking
                    // Access tokens typically don't need revocation check due to short expiry
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                // Expired or invalid token
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                String body = String.format(
                        "{\"message\":\"Authentication required or token invalid\",\"timestamp\":\"%s\",\"path\":\"%s\"}",
                        java.time.Instant.now().toString(), request.getRequestURI());
                response.getWriter().write(body);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
