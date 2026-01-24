package com.college.service;

import com.college.model.Admission;
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

    @Transactional
    public Admission createAdmission(Admission admission) {
        // Defensive null check
        if (admission == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission data is required");
        }

        // Validate mandatory fields
        if (admission.getStudentId() == null || admission.getStudentId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required");
        }
        if (!studentRepository.existsById(admission.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID does not exist");
        }
        if (admission.getDepartmentId() == null || admission.getDepartmentId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department ID is required");
        }
        if (!departmentRepository.existsById(admission.getDepartmentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department ID does not exist");
        }
        if (admission.getAcademicYear() == null || admission.getAcademicYear().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Academic year is required");
        }
        if (admission.getAdmissionStatus() == null
                || !List.of("APPLIED", "APPROVED", "REJECTED").contains(admission.getAdmissionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valid admission status is required (APPLIED, APPROVED, REJECTED)");
        }

        admission.setCreatedAt(LocalDateTime.now());
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
        // Defensive null checks
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission ID is required");
        }
        if (admission == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission data is required");
        }

        Admission existing = admissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));

        // Update allowed fields
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
        if (admission.getScholarshipCategory() != null)
            existing.setScholarshipCategory(admission.getScholarshipCategory());

        // Validate and update departmentId
        if (admission.getDepartmentId() != null) {
            if (!departmentRepository.existsById(admission.getDepartmentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department ID does not exist");
            }
            existing.setDepartmentId(admission.getDepartmentId());
        }

        // Update academicYear
        if (admission.getAcademicYear() != null)
            existing.setAcademicYear(admission.getAcademicYear());

        // Atomic status update
        if (admission.getAdmissionStatus() != null) {
            if (!List.of("APPLIED", "APPROVED", "REJECTED").contains(admission.getAdmissionStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid admission status");
            }
            existing.setAdmissionStatus(admission.getAdmissionStatus());
        }

        return admissionRepository.save(existing);
    }

    @Transactional
    public void deleteAdmission(String id) {
        // Defensive check
        if (id == null || id.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admission ID is required");
        }

        Admission existing = admissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admission not found"));

        if ("APPROVED".equalsIgnoreCase(existing.getAdmissionStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Approved admission cannot be deleted");
        }

        admissionRepository.deleteById(id);
    }
}
