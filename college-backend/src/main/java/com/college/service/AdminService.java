package com.college.service;

import com.college.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private ReportRepository reportRepository;

    public Map<String, Long> getDashboardCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("totalDepartments", departmentRepository.count());
        counts.put("totalStudents", studentRepository.count());
        counts.put("totalFaculty", facultyRepository.count());
        
        long pendingFees = feeRepository.findAll().stream()
                .mapToLong(fee -> fee.getPendingAmount() > 0 ? 1 : 0)
                .sum();
        counts.put("totalPendingFees", pendingFees);
        
        long unresolvedReports = reportRepository.findByStatus("Open").size();
        counts.put("totalUnresolvedReports", unresolvedReports);
        
        return counts;
    }
}
