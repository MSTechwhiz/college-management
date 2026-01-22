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
    public ResponseEntity<?> markAttendance(@RequestBody Attendance attendance, @RequestHeader("Authorization") String token) {
        try {
            String facultyId = jwtUtil.extractUsername(token.substring(7));
            return ResponseEntity.ok(attendanceService.markAttendance(attendance, facultyId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<?> markBulkAttendance(@RequestBody Map<String, Object> request, @RequestHeader("Authorization") String token) {
        try {
            String facultyId = jwtUtil.extractUsername(token.substring(7));
            String subject = request.get("subject").toString();
            String date = request.get("date").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> attendanceList = (List<Map<String, Object>>) request.get("attendanceList");
            
            attendanceService.markBulkAttendance(subject, date, attendanceList, facultyId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<List<Attendance>> getAttendanceByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping("/percentage/{studentId}/{subject}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<Double> getAttendancePercentage(@PathVariable String studentId, @PathVariable String subject) {
        return ResponseEntity.ok(attendanceService.getAttendancePercentage(studentId, subject));
    }
}
