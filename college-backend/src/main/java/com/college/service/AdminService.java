package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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

    @Autowired
    private UserRepository userRepository;

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

    public Map<String, Object> globalSearch(String query) {
        Map<String, Object> results = new HashMap<>();
        
        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        Set<Student> studentSet = new HashSet<>();
        Set<Faculty> facultySet = new HashSet<>();
        Set<Department> departmentSet = new HashSet<>();

        // 1. Search by Username
        userRepository.findByUsername(query).ifPresent(user -> {
            studentRepository.findByUserId(user.getId()).ifPresent(studentSet::add);
            facultyRepository.findByUserId(user.getId()).ifPresent(facultySet::add);
        });

        // 2. Search by Name / Register Number / Faculty ID
        studentSet.addAll(studentRepository.findByFullNameContainingIgnoreCaseOrRegisterNumberContainingIgnoreCase(query, query));
        facultySet.addAll(facultyRepository.findByNameContainingIgnoreCaseOrFacultyIdContainingIgnoreCase(query, query));

        // 3. Search by Department
        departmentSet.addAll(departmentRepository.findByNameContainingIgnoreCase(query));
        // Include students and faculty from matching departments
        studentSet.addAll(studentRepository.findByDepartmentContainingIgnoreCase(query));
        facultySet.addAll(facultyRepository.findByDepartmentContainingIgnoreCase(query));

        // 4. Filter HODs
        List<Faculty> allFaculty = new ArrayList<>(facultySet);
        List<Faculty> hods = allFaculty.stream()
                .filter(f -> "HOD".equalsIgnoreCase(f.getRole()))
                .collect(Collectors.toList());

        results.put("students", new ArrayList<>(studentSet));
        results.put("faculty", allFaculty);
        results.put("hods", hods);
        results.put("departments", new ArrayList<>(departmentSet));
        
        return results;
    }
}
