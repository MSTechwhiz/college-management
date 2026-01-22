package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentDashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarkRepository markRepository;

    public Map<String, Object> getStudentDashboard(String username) {
        // Find user by username, then find student by userId
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));

        List<Fee> fees = feeRepository.findByStudentId(student.getId());
        List<Attendance> attendance = attendanceRepository.findByStudentId(student.getId());
        List<Mark> marks = markRepository.findByStudentId(student.getId());

        double attendancePercentage = calculateAttendancePercentage(attendance);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("student", student);
        dashboard.put("feesSummary", calculateFeesSummary(fees));
        dashboard.put("attendancePercentage", attendancePercentage);
        dashboard.put("marks", marks);

        return dashboard;
    }

    private Map<String, Object> calculateFeesSummary(List<Fee> fees) {
        double total = fees.stream().mapToDouble(Fee::getTotalAmount).sum();
        double paid = fees.stream().mapToDouble(Fee::getPaidAmount).sum();
        double pending = fees.stream().mapToDouble(Fee::getPendingAmount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", total);
        summary.put("paid", paid);
        summary.put("pending", pending);
        return summary;
    }

    private double calculateAttendancePercentage(List<Attendance> attendance) {
        if (attendance.isEmpty()) return 0.0;
        long presentCount = attendance.stream().filter(Attendance::isPresent).count();
        return (presentCount * 100.0) / attendance.size();
    }
}
