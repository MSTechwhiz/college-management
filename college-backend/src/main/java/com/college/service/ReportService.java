package com.college.service;

import com.college.model.Report;
import com.college.model.Student;
import com.college.repository.ReportRepository;
import com.college.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Report createReport(Report report, String studentId) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID cannot be null or empty");
        }
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        String registerNumber = student.getRegisterNumber();
        if (registerNumber == null) {
            throw new IllegalStateException("Student register number is null");
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

    public Report assignToHOD(String reportId, String hodId) {
        if (reportId == null || reportId.trim().isEmpty()) {
            throw new IllegalArgumentException("Report ID cannot be null or empty");
        }
        
        if (hodId == null || hodId.trim().isEmpty()) {
            throw new IllegalArgumentException("HOD ID cannot be null or empty");
        }
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setAssignedTo(hodId);
        return reportRepository.save(report);
    }

    public Report resolveReport(String reportId, String resolvedBy, String remarks) {
        if (reportId == null || reportId.trim().isEmpty()) {
            throw new IllegalArgumentException("Report ID cannot be null or empty");
        }
        
        if (resolvedBy == null || resolvedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("Resolved by cannot be null or empty");
        }
        
        if (remarks == null) {
            remarks = ""; // Allow empty remarks but not null
        }
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("Resolved");
        report.setResolvedBy(resolvedBy);
        report.setResolutionRemarks(remarks);
        report.setResolvedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }
}
