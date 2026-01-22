package com.college.service;

import com.college.model.Department;
import com.college.model.Faculty;
import com.college.model.Student;
import com.college.model.User;
import com.college.repository.DepartmentRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.StudentRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FacultyDashboardService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Map<String, Object> getFacultyDashboard(String username) {
        // Find user by username, then find faculty by userId
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Faculty not found for user: " + username));

        Department dept = departmentRepository.findByName(faculty.getDepartment())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        List<Student> students = studentRepository.findByDepartment(faculty.getDepartment());
        Map<Integer, Long> studentCountByYear = new HashMap<>();
        for (int year = 1; year <= 4; year++) {
            final int currentYear = year; // Make effectively final for lambda
            long count = students.stream()
                    .filter(s -> s.getYear() == currentYear)
                    .count();
            studentCountByYear.put(currentYear, count);
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("department", dept.getName());
        dashboard.put("hodName", dept.getHodName());
        dashboard.put("subjects", faculty.getSubjects());
        dashboard.put("studentCountByYear", studentCountByYear);

        return dashboard;
    }

    public List<Student> getStudentsByYear(String department, int year) {
        return studentRepository.findByDepartmentAndYear(department, year);
    }
}
