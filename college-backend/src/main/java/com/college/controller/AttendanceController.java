package com.college.controller;

import com.college.model.Attendance;
import com.college.security.JwtUtil;
import com.college.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Attendance> markAttendance(@RequestBody Attendance attendance,
            @RequestHeader("Authorization") String token) {
        String facultyId = jwtUtil.extractUsername(token.substring(7));
        // Save attendance and immediately return the saved object (read-after-write
        // consistency)
        Attendance saved = attendanceService.markAttendance(attendance, facultyId);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<?> markBulkAttendance(@RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String token) {
        String facultyId = jwtUtil.extractUsername(token.substring(7));
        String subject = request.get("subject").toString();
        String date = request.get("date").toString();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> attendanceList = (List<Map<String, Object>>) request.get("attendanceList");

        attendanceService.markBulkAttendance(subject, date, attendanceList, facultyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<List<Attendance>> getAttendanceByStudent(
            @PathVariable String studentId,
            @RequestHeader("Authorization") String token) {
        // Derive student identity for STUDENT role from JWT (backend source of truth)
        String jwt = token.substring(7);
        String role = jwtUtil.extractRole(jwt);
        String identifier = "STUDENT".equals(role) ? jwtUtil.extractUsername(jwt) : studentId;
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(identifier));
    }

    @GetMapping("/percentage/{studentId}/{subject}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<Double> getAttendancePercentage(
            @PathVariable String studentId, @PathVariable String subject,
            @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String role = jwtUtil.extractRole(jwt);
        String identifier = "STUDENT".equals(role) ? jwtUtil.extractUsername(jwt) : studentId;
        return ResponseEntity.ok(attendanceService.getAttendancePercentage(identifier, subject));
    }
}
