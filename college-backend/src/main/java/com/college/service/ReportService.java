package com.college.service;

import com.college.model.Report;
import com.college.model.Student;
import com.college.model.User;
import com.college.repository.ReportRepository;
import com.college.repository.StudentRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    public Report createReportForUser(Report report, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Try to find student by User ID first
        Student student = studentRepository.findByUserId(user.getId())
                .orElse(null);

        // Fallback: Try to find student by Register Number (assuming username is register number)
        if (student == null) {
            student = studentRepository.findByRegisterNumber(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Student profile not found for user: " + username));
        }

        return createReport(report, student.getId());
    }

    public List<Report> getReportsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Student profile not found for user: " + username));

        return reportRepository.findByStudentId(student.getId());
    }

    @Transactional
    public Report createReport(Report report, String studentId) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID cannot be null or empty");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        String registerNumber = student.getRegisterNumber();
        if (registerNumber == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student register number is missing");
        }

        if (report == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report data is required");
        }

        if (report.getCategory() == null || report.getCategory().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report category is required");
        }

        if (report.getDescription() == null || report.getDescription().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report description is required");
        }

        report.setStudentId(studentId);
        report.setRegisterNumber(registerNumber);
        report.setStatus("Open");
        report.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByStudent(String studentId) {
        return reportRepository.findByStudentId(studentId);
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    public List<Report> getReportsByCategoryAndStatus(String category, String status) {
        return reportRepository.findByCategoryAndStatus(category, status);
    }

    @Transactional
    public Report assignToHOD(String reportId, String hodId) {
        if (reportId == null || reportId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report ID cannot be null or empty");
        }

        if (hodId == null || hodId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "HOD ID cannot be null or empty");
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setAssignedTo(hodId);
        return reportRepository.save(report);
    }

    @Transactional
    public Report resolveReport(String reportId, String resolvedBy, String remarks) {
        if (reportId == null || reportId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Report ID cannot be null or empty");
        }

        if (resolvedBy == null || resolvedBy.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolved by cannot be null or empty");
        }

        if (remarks == null) {
            remarks = "";
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus("Resolved");
        report.setResolvedBy(resolvedBy);
        report.setResolutionRemarks(remarks);
        report.setResolvedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }
}
