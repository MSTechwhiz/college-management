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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found"));
    }

    @Transactional
    public Faculty createFaculty(Faculty faculty) {
        // Defensive null check
        if (faculty == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty data is required");
        }

        String facultyId = faculty.getFacultyId();
        if (facultyId == null || facultyId.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty ID is required");
        }

        if (facultyRepository.existsByFacultyId(facultyId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Faculty ID already exists");
        }

        String department = faculty.getDepartment();
        if (department == null || department.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Department is required");
        }

        // Verify department exists (referential integrity)
        if (!departmentRepository.findById(department).isPresent() &&
                departmentRepository.findAll().stream().noneMatch(d -> d.getName().equals(department))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Department does not exist");
        }

        // Create user account (transaction safety: both succeed or both fail)
        User user = new User();
        user.setUsername(facultyId);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("FACULTY");
        user.setDepartments(java.util.Arrays.asList(department));
        user.setDepartment(department);

        User savedUser = userRepository.save(user);
        if (savedUser == null || savedUser.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create user account for faculty");
        }

        faculty.setUserId(savedUser.getId());
        faculty.setRole("FACULTY");

        Faculty savedFaculty = facultyRepository.save(faculty);
        if (savedFaculty == null || savedFaculty.getId() == null) {
            // Rollback: delete user if faculty creation fails
            userRepository.delete(savedUser);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create faculty record");
        }

        return savedFaculty;
    }

    @Transactional
    public Faculty updateFaculty(String id, Faculty faculty) {
        // Defensive null checks
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty ID is required");
        }
        if (faculty == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty data is required");
        }

        Faculty existing = facultyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found"));

        String newFacultyId = faculty.getFacultyId();
        if (newFacultyId != null && !newFacultyId.trim().isEmpty()) {
            if (!existing.getFacultyId().equals(newFacultyId) &&
                    facultyRepository.existsByFacultyId(newFacultyId)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Faculty ID already exists");
            }
            existing.setFacultyId(newFacultyId);
        }

        String department = faculty.getDepartment();
        if (department != null && !department.trim().isEmpty()) {
            existing.setDepartment(department);
        }

        if (faculty.getName() != null) {
            existing.setName(faculty.getName());
        }
        if (faculty.getSubjects() != null && !faculty.getSubjects().isEmpty()) {
            existing.setSubjects(faculty.getSubjects());
        }
        if (faculty.getYears() != null && !faculty.getYears().isEmpty()) {
            existing.setYears(faculty.getYears());
        }

        return facultyRepository.save(existing);
    }

    @Transactional
    public void deleteFaculty(String id) {
        // Defensive check
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty ID is required");
        }

        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found"));

        // Remove HOD assignment from department if this faculty is HOD (maintain
        // referential integrity)
        String facultyRole = faculty.getRole();
        if ("HOD".equalsIgnoreCase(facultyRole)) {
            Optional<Department> deptOpt = departmentRepository.findById(faculty.getDepartment());
            if (deptOpt.isPresent()) {
                Department dept = deptOpt.get();
                if (faculty.getId().equals(dept.getHodId())) {
                    dept.setHodId(null);
                    dept.setHodName(null);
                    departmentRepository.save(dept);
                }
            }
        }

        // Clean up user account
        if (faculty.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(faculty.getUserId());
            if (userOpt.isPresent()) {
                userRepository.delete(userOpt.get());
            }
        }

        // Finally delete faculty
        facultyRepository.deleteById(id);
    }

    public Faculty promoteToHOD(String id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found"));

        String departmentName = faculty.getDepartment();
        if (departmentName == null || departmentName.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty department cannot be null or empty");
        }

        // Defensive check: verify department exists
        Optional<Department> deptOpt = departmentRepository.findByName(departmentName);
        if (!deptOpt.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Department not found: " + departmentName);
        }

        Department dept = deptOpt.get();

        // Remove existing HOD if present
        if (dept.getHodId() != null) {
            Optional<Faculty> existingHODOpt = facultyRepository.findByFacultyId(dept.getHodId());
            if (existingHODOpt.isPresent()) {
                Faculty existingHOD = existingHODOpt.get();
                existingHOD.setRole("FACULTY");
                facultyRepository.save(existingHOD);
            }
        }

        // Set new HOD
        String facultyId = faculty.getFacultyId();
        if (facultyId == null || facultyId.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Faculty ID is required");
        }

        dept.setHodId(facultyId);
        dept.setHodName(faculty.getName());
        departmentRepository.save(dept);

        faculty.setRole("HOD");
        return facultyRepository.save(faculty);
    }
}
