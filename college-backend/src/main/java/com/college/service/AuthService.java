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

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getRole().equals(request.getRole())) {
            throw new RuntimeException("Invalid role");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getDepartment());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(user.getRole());
        response.setUsername(user.getUsername());
        response.setDepartment(user.getDepartment());
        response.setDepartments(user.getDepartments());
        
        return response;
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
