package com.college.dto;

public class LoginResponse {
    private String token;
    private String role;
    private String username;
    private String department;
    private java.util.List<String> departments;

    public LoginResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public java.util.List<String> getDepartments() { return departments; }
    public void setDepartments(java.util.List<String> departments) { this.departments = departments; }
}
