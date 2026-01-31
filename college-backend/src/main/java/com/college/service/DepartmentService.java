package com.college.service;

import com.college.model.Department;
import com.college.model.Faculty;
import com.college.model.Student;
import com.college.repository.DepartmentRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private FacultyService facultyService;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getActiveDepartmentsForDropdown() {
        return departmentRepository.findAll().stream()
                .filter(Department::isActive)
                .sorted(Comparator.comparing(Department::getName))
                .collect(Collectors.toList());
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department with this name already exists");
        }
        return departmentRepository.save(department);
    }

    public Map<String, Object> getDepartmentDetail(String departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        String departmentName = Objects.requireNonNull(dept.getName(), "Department name cannot be null");

        List<Student> students = studentRepository.findByDepartment(departmentName);
        List<Faculty> faculty = facultyRepository.findByDepartment(departmentName);

        Map<String, Object> detail = new HashMap<>();
        detail.put("department", dept);
        detail.put("students", students);
        detail.put("faculty", faculty);

        if (dept.getHodId() != null) {
            facultyRepository.findById(dept.getHodId()).ifPresent(hod -> detail.put("hod", hod));
        }

        return detail;
    }

    public void assignHod(String departmentId, String facultyId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found"));

        if (!dept.getName().equals(faculty.getDepartment())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faculty does not belong to this department");
        }

        facultyService.promoteToHOD(facultyId);
    }

    public List<Map<String, Object>> getDepartmentsWithCounts() {
        List<Department> departments = departmentRepository.findAll().stream()
                .filter(Department::isActive)
                .sorted(Comparator.comparing(Department::getName))
                .collect(Collectors.toList());
        return departments.stream().map(dept -> {
            Map<String, Object> deptInfo = new HashMap<>();
            deptInfo.put("id", dept.getId());
            deptInfo.put("name", dept.getName());
            deptInfo.put("hodId", dept.getHodId());
            deptInfo.put("hodName", dept.getHodName());

            String departmentName = dept.getName();
            if (departmentName == null) {
                deptInfo.put("studentCount", 0L);
                deptInfo.put("facultyCount", 0L);
                return deptInfo;
            }

            // departmentName is guaranteed non-null here
            String nonNullDepartmentName = departmentName;
            long studentCount = studentRepository.findByDepartment(nonNullDepartmentName).size();
            long facultyCount = facultyRepository.findByDepartment(nonNullDepartmentName).size();

            deptInfo.put("studentCount", studentCount);
            deptInfo.put("facultyCount", facultyCount);

            return deptInfo;
        }).collect(Collectors.toList());
    }
}
