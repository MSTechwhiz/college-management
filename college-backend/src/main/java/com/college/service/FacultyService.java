package com.college.service;

import com.college.model.Department;
import com.college.model.Faculty;
import com.college.model.User;
import com.college.repository.DepartmentRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    public Faculty getFacultyById(String id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
    }

    public Faculty createFaculty(Faculty faculty) {
        String facultyId = Objects.requireNonNull(faculty.getFacultyId(), "Faculty ID cannot be null");
        if (facultyId.trim().isEmpty()) {
            throw new IllegalArgumentException("Faculty ID cannot be empty");
        }
        
        if (facultyRepository.existsByFacultyId(facultyId)) {
            throw new RuntimeException("Faculty ID already exists");
        }

        String department = Objects.requireNonNull(faculty.getDepartment(), "Department cannot be null");
        if (department.trim().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be empty");
        }

        // Create user account
        User user = new User();
        user.setUsername(facultyId);
        user.setPassword(passwordEncoder.encode("password123")); // Default password
        user.setRole("FACULTY");
        user.setDepartments(java.util.Arrays.asList(department));
        user.setDepartment(department);
        user = userRepository.save(user);

        faculty.setUserId(user.getId());
        faculty.setRole("FACULTY");
        return facultyRepository.save(faculty);
    }

    public Faculty updateFaculty(String id, Faculty faculty) {
        Faculty existing = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        String existingFacultyId = Objects.requireNonNull(existing.getFacultyId(), "Existing faculty ID cannot be null");
        String newFacultyId = Objects.requireNonNull(faculty.getFacultyId(), "Faculty ID cannot be null");
        
        if (newFacultyId.trim().isEmpty()) {
            throw new IllegalArgumentException("Faculty ID cannot be empty");
        }

        if (!existingFacultyId.equals(newFacultyId) &&
            facultyRepository.existsByFacultyId(newFacultyId)) {
            throw new RuntimeException("Faculty ID already exists");
        }

        String department = Objects.requireNonNull(faculty.getDepartment(), "Department cannot be null");
        existing.setName(faculty.getName());
        existing.setDepartment(department);
        existing.setSubjects(faculty.getSubjects());
        existing.setYears(faculty.getYears());

        return facultyRepository.save(existing);
    }

    public void deleteFaculty(String id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        // Remove HOD if this faculty is HOD
        String facultyRole = faculty.getRole();
        if ("HOD".equals(facultyRole)) {
            String departmentName = faculty.getDepartment();
            if (departmentName == null) {
                throw new IllegalStateException("Faculty department is null");
            }
            
            Optional<Department> deptOpt = departmentRepository.findByName(departmentName);
            if (deptOpt.isPresent()) {
                Department dept = deptOpt.get();
                String facultyId = faculty.getFacultyId();
                if (facultyId != null && facultyId.equals(dept.getHodId())) {
                    dept.setHodId(null);
                    dept.setHodName(null);
                    departmentRepository.save(dept);
                }
            }
        }

        facultyRepository.deleteById(id);
    }

    public Faculty promoteToHOD(String id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        String departmentName = Objects.requireNonNull(faculty.getDepartment(), "Faculty department cannot be null");
        if (departmentName.trim().isEmpty()) {
            throw new IllegalStateException("Faculty department cannot be empty");
        }

        // Remove existing HOD
        Department dept = departmentRepository.findByName(departmentName)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentName));

        if (dept.getHodId() != null) {
            Faculty existingHOD = facultyRepository.findByFacultyId(dept.getHodId())
                    .orElse(null);
            if (existingHOD != null) {
                existingHOD.setRole("FACULTY");
                facultyRepository.save(existingHOD);
            }
        }

        // Set new HOD
        String facultyId = Objects.requireNonNull(faculty.getFacultyId(), "Faculty ID cannot be null");
        dept.setHodId(facultyId);
        dept.setHodName(faculty.getName());
        departmentRepository.save(dept);

        faculty.setRole("HOD");
        return facultyRepository.save(faculty);
    }
}
