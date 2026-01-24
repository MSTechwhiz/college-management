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

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getActiveDepartmentsForDropdown() {
        return departmentRepository.findAll().stream()
                .filter(Department::isActive)
                .sorted(Comparator.comparing(Department::getName))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDepartmentDetail(String departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

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
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        // Validate faculty belongs to department (optional but good)
        if (!dept.getName().equalsIgnoreCase(faculty.getDepartment())) {
             // Maybe allow cross-dept HOD? Usually not. Warn or Block.
             // Prompt doesn't specify, but "Department page shows HOD" implies linkage.
             // Let's allow it for flexibility but maybe we should ensure consistency.
        }

        dept.setHodId(faculty.getId());
        dept.setHodName(faculty.getName());
        departmentRepository.save(dept);
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
