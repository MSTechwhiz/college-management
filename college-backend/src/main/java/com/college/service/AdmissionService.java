package com.college.service;

import com.college.model.Admission;
import com.college.model.Student;
import com.college.repository.AdmissionRepository;
import com.college.repository.DepartmentRepository;
import com.college.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AdmissionService {

    @Autowired
    private AdmissionRepository admissionRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private StudentService studentService;
    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;

    @Transactional
    public Admission createAdmission(Admission admission) {
        // Defensive null check
        if (admission == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission data is required");
        }

        // Validate duplicates
        if (admission.getRegisterNumber() != null && !admission.getRegisterNumber().isEmpty()) {
            if (admissionRepository.existsByRegisterNumber(admission.getRegisterNumber())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Admission with register number " + admission.getRegisterNumber() + " already exists");
            }
            if (studentRepository.existsByRegisterNumber(admission.getRegisterNumber())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Student with register number " + admission.getRegisterNumber() + " already exists");
            }
        }

        if (admission.getEmail() != null && !admission.getEmail().isEmpty()) {
            if (admissionRepository.existsByEmail(admission.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Admission with email " + admission.getEmail() + " already exists");
            }
        }

        // Validate department
        if (admission.getDepartmentId() == null && admission.getDepartment() != null) {
            departmentRepository.findByName(admission.getDepartment())
                    .ifPresent(d -> admission.setDepartmentId(d.getId()));
        }

        if (admission.getDepartmentId() != null) {
            if (!departmentRepository.existsById(admission.getDepartmentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Department not found with ID: " + admission.getDepartmentId());
            }
        } else if (admission.getDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department is required");
        }

        // Set default status if missing
        if (admission.getAdmissionStatus() == null) {
            admission.setAdmissionStatus("APPLIED");
        }
        if (admission.getStatus() == null) {
            admission.setStatus("Pending");
        }

        // Set default academic year if missing
        if (admission.getAcademicYear() == null || admission.getAcademicYear().trim().isEmpty()) {
            java.time.LocalDate now = java.time.LocalDate.now();
            int start = now.getMonthValue() >= 6 ? now.getYear() : now.getYear() - 1;
            admission.setAcademicYear(start + "-" + (start + 1));
        }

        admission.setCreatedAt(LocalDateTime.now());

        // Save Admission - Student creation happens on Approval
        return admissionRepository.save(admission);
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    public Admission getAdmissionById(String id) {
        return admissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));
    }

    public List<Admission> getAdmissionsByDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        if (departmentRepository.existsById(department)) {
            return admissionRepository.findByDepartmentId(department);
        }
        return admissionRepository.findByDepartment(department);
    }

    public Map<String, Map<String, Long>> getDepartmentStatistics() {
        List<Admission> allAdmissions = admissionRepository.findAll();
        return allAdmissions.stream()
                .collect(Collectors.groupingBy(Admission::getDepartmentId,
                        Collectors.groupingBy(
                                admission -> admission.getAdmissionStatus() != null ? admission.getAdmissionStatus()
                                        : "UNKNOWN",
                                Collectors.counting())));
    }

    @Transactional
    public Admission updateAdmission(String id, Admission admission) {
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission ID is required");
        }

        Admission existing = admissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));

        // Update fields
        if (admission.getStudentName() != null)
            existing.setStudentName(admission.getStudentName());
        if (admission.getEmail() != null)
            existing.setEmail(admission.getEmail());
        if (admission.getPhone() != null)
            existing.setPhone(admission.getPhone());
        if (admission.getTenthMarks() != null)
            existing.setTenthMarks(admission.getTenthMarks());
        if (admission.getTwelfthMarks() != null)
            existing.setTwelfthMarks(admission.getTwelfthMarks());
        if (admission.getRegisterNumber() != null)
            existing.setRegisterNumber(admission.getRegisterNumber());
        if (admission.getAdmissionMethod() != null)
            existing.setAdmissionMethod(admission.getAdmissionMethod());
        if (admission.getQuota() != null)
            existing.setQuota(admission.getQuota());
        if (admission.getScholarshipCategory() != null) {
            existing.setScholarshipCategory(admission.getScholarshipCategory());
        }
        if (admission.getCutoff() != null)
            existing.setCutoff(admission.getCutoff());

        if (admission.getDepartmentId() != null) {
            if (!departmentRepository.existsById(admission.getDepartmentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department ID does not exist");
            }
            existing.setDepartmentId(admission.getDepartmentId());
        }

        // Handle Status Change
        if (admission.getStatus() != null) {
            existing.setStatus(admission.getStatus());
            // Sync internal admissionStatus
            if ("Approved".equalsIgnoreCase(admission.getStatus())) {
                existing.setAdmissionStatus("APPROVED");
            } else if ("Rejected".equalsIgnoreCase(admission.getStatus())) {
                existing.setAdmissionStatus("REJECTED");
            } else {
                existing.setAdmissionStatus("APPLIED");
            }
        }

        // Check if becoming Approved and needs Student record
        if ("APPROVED".equalsIgnoreCase(existing.getAdmissionStatus())) {
            // Generate Register Number if missing
            if (existing.getRegisterNumber() == null || existing.getRegisterNumber().trim().isEmpty()) {
                String generatedRegNo = generateRegisterNumber(existing);
                existing.setRegisterNumber(generatedRegNo);
            }

            if (existing.getStudentId() == null) {
                createStudentFromAdmission(existing);
            }
        }

        return admissionRepository.save(existing);
    }

    private String generateRegisterNumber(Admission admission) {
        // Format: <Year><DeptCode><Sequence>
        // Example: 2024CSE001

        // 1. Get Year (Start year of academic year)
        String yearPrefix = "";
        if (admission.getAcademicYear() != null && admission.getAcademicYear().contains("-")) {
            yearPrefix = admission.getAcademicYear().split("-")[0];
        } else {
            yearPrefix = String.valueOf(java.time.LocalDate.now().getYear());
        }

        // 2. Get Department Code
        String deptCode = "GEN"; // Default
        com.college.model.Department dept = departmentRepository.findById(admission.getDepartmentId())
                .orElse(null);

        if (dept != null) {
            if (dept.getCode() != null && !dept.getCode().isEmpty()) {
                deptCode = dept.getCode();
            } else {
                // Fallback: Generate code from name (First 3 chars upper)
                String name = dept.getName().replaceAll("[^a-zA-Z]", "");
                deptCode = name.length() >= 3 ? name.substring(0, 3).toUpperCase() : name.toUpperCase();
            }
        }

        // 3. Generate Sequence
        // Sequence name key: REG_SEQUENCE_<Year>_<DeptCode>
        String sequenceKey = "REG_SEQUENCE_" + yearPrefix + "_" + deptCode;
        long seq = sequenceGeneratorService.generateSequence(sequenceKey);

        // 4. Format
        return String.format("%s%s%03d", yearPrefix, deptCode, seq);
    }

    private void createStudentFromAdmission(Admission admission) {
        // Double check duplicate before creating
        if (admission.getRegisterNumber() != null
                && studentRepository.existsByRegisterNumber(admission.getRegisterNumber())) {
            // Already exists, maybe link it?
            Student s = studentRepository.findByRegisterNumber(admission.getRegisterNumber()).get();
            admission.setStudentId(s.getId());
            return;
        }

        // Validate we have enough info
        if (admission.getRegisterNumber() == null || admission.getRegisterNumber().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot approve admission without Register Number");
        }

        Student newStudent = new Student();
        newStudent.setRegisterNumber(admission.getRegisterNumber());
        newStudent.setFullName(admission.getStudentName());
        newStudent.setDepartment(admission.getDepartment());

        // Set Defaults
        newStudent.setYear(1);
        newStudent.setSemester(1);
        newStudent.setAdmissionType(
                admission.getAdmissionMethod() != null ? admission.getAdmissionMethod() : "Management");
        newStudent.setScholarshipCategory(admission.getScholarshipCategory());
        newStudent.setAcademicYear(admission.getAcademicYear());

        // Save Student
        Student saved = studentService.createStudent(newStudent);

        // Link back
        admission.setStudentId(saved.getId());
    }

    @Transactional
    public Admission deleteAdmissionAndReturn(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission ID is required");
        }
        Admission existing = admissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));

        if ("APPROVED".equalsIgnoreCase(existing.getAdmissionStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete approved admission. Please delete the student record first.");
        }

        admissionRepository.deleteById(id);
        return existing;
    }
}
