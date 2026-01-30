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

        // Resolve student linkage from provided data
        // (studentId/registerNumber/studentName)
        if (admission.getStudentId() == null || admission.getStudentId().trim().isEmpty()) {
            // Try using registerNumber first
            if (admission.getRegisterNumber() != null && !admission.getRegisterNumber().trim().isEmpty()) {
                studentRepository.findByRegisterNumber(admission.getRegisterNumber())
                        .ifPresent(s -> {
                            admission.setStudentId(s.getId());
                            admission.setStudentName(s.getFullName());
                            if (admission.getDepartment() == null)
                                admission.setDepartment(s.getDepartment());
                        });
            }
            // Fallback: try fuzzy match on studentName
            if (admission.getStudentId() == null && admission.getStudentName() != null) {
                List<com.college.model.Student> matches = studentRepository
                        .findByFullNameContainingIgnoreCaseOrRegisterNumberContainingIgnoreCase(
                                admission.getStudentName(), admission.getStudentName());
                if (!matches.isEmpty()) {
                    com.college.model.Student s = matches.get(0);
                    admission.setStudentId(s.getId());
                    admission.setRegisterNumber(s.getRegisterNumber());
                    if (admission.getDepartment() == null)
                        admission.setDepartment(s.getDepartment());
                }
            }
        }
        if (admission.getStudentId() == null || !studentRepository.existsById(admission.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid Student linkage is required");
        }

        // Resolve departmentId from department name if missing
        if (admission.getDepartmentId() == null || admission.getDepartmentId().trim().isEmpty()) {
            if (admission.getDepartment() != null && !admission.getDepartment().trim().isEmpty()) {
                departmentRepository.findByName(admission.getDepartment())
                        .ifPresent(d -> admission.setDepartmentId(d.getId()));
            }
        }
        if (admission.getDepartmentId() == null || !departmentRepository.existsById(admission.getDepartmentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid Department linkage is required");
        }

        // Map UI fields to backend canonical fields
        if (admission.getScholarshipCategory() == null && admission.getStatus() != null) {
            // no-op here; status handled below
        }
        if (admission.getScholarshipCategory() == null && admission.getQuota() == null) {
            // Map 'scholarship' UI value into scholarshipCategory if present in payload via
            // model binding
            // Admission model already has scholarshipCategory; leave as-is if provided
        }
        // Admission status: map UI 'status' (Pending/Approved/Rejected) to canonical
        // (APPLIED/APPROVED/REJECTED)
        if (admission.getAdmissionStatus() == null) {
            String uiStatus = admission.getStatus();
            if (uiStatus != null) {
                switch (uiStatus) {
                    case "Pending":
                        admission.setAdmissionStatus("APPLIED");
                        break;
                    case "Approved":
                        admission.setAdmissionStatus("APPROVED");
                        break;
                    case "Rejected":
                        admission.setAdmissionStatus("REJECTED");
                        break;
                }
            }
        }
        if (admission.getAdmissionStatus() == null
                || !List.of("APPLIED", "APPROVED", "REJECTED").contains(admission.getAdmissionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valid admission status is required (APPLIED, APPROVED, REJECTED)");
        }

        // Academic year default if missing: current academic year format YYYY-YYYY
        if (admission.getAcademicYear() == null || admission.getAcademicYear().trim().isEmpty()) {
            java.time.LocalDate now = java.time.LocalDate.now();
            int start = now.getMonthValue() >= 6 ? now.getYear() : now.getYear() - 1;
            admission.setAcademicYear(start + "-" + (start + 1));
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
        // Support both departmentId and name for compatibility
        if (department == null || department.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        // Try as ID
        if (departmentRepository.existsById(department)) {
            return admissionRepository.findByDepartmentId(department);
        }
        // Try as name
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

        // Update all allowed fields - full data persistence
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
        if (admission.getAdmissionDate() != null)
            existing.setAdmissionDate(admission.getAdmissionDate());
        if (admission.getDepartment() != null)
            existing.setDepartment(admission.getDepartment());
        if (admission.getStatus() != null)
            existing.setStatus(admission.getStatus());

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

        // Atomic status update - validate BEFORE updating
        if (admission.getAdmissionStatus() != null) {
            if (!List.of("APPLIED", "APPROVED", "REJECTED").contains(admission.getAdmissionStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid admission status");
            }
            existing.setAdmissionStatus(admission.getAdmissionStatus());
        }

        // Persist and return full data immediately
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

    @Transactional
    public Admission deleteAdmissionAndReturn(String id) {
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
        // Return the deleted admission for audit trail purposes
        return existing;
    }
}
