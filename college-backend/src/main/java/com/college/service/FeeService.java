package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public List<Fee> getFeesByStudent(String studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public FeeStructure createFeeStructure(FeeStructure feeStructure) {
        return feeStructureRepository.save(feeStructure);
    }

    public List<FeeStructure> getAllFeeStructures() {
        return feeStructureRepository.findAll();
    }

    public Fee overrideFee(String feeId, double amount, String reason, String adminId) {
        if (feeId == null || feeId.trim().isEmpty()) {
            throw new IllegalArgumentException("Fee ID cannot be null or empty");
        }
        
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason cannot be null or empty");
        }
        
        if (adminId == null || adminId.trim().isEmpty()) {
            throw new IllegalArgumentException("Admin ID cannot be null or empty");
        }
        
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        Fee.FeeOverride override = new Fee.FeeOverride();
        override.setAmount(amount);
        override.setReason(reason);
        override.setAdminId(adminId);
        override.setTimestamp(java.time.LocalDateTime.now().toString());

        if (fee.getOverrides() == null) {
            fee.setOverrides(new java.util.ArrayList<>());
        }
        fee.getOverrides().add(override);

        fee.setTotalAmount(fee.getTotalAmount() + amount);
        fee.setPendingAmount(fee.getTotalAmount() - fee.getPaidAmount());

        return feeRepository.save(fee);
    }

    public Fee createOrUpdateFee(String studentId, int year, int semester) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID cannot be null or empty");
        }
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String department = student.getDepartment();
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalStateException("Student department is null or empty");
        }

        Optional<Fee> existingFee = feeRepository.findByStudentIdAndYearAndSemester(studentId, year, semester);
        
        Optional<FeeStructure> structureOpt = feeStructureRepository
                .findByDepartmentAndYearAndSemester(department, year, semester);
        
        FeeStructure structure = structureOpt.orElseGet(() -> {
            FeeStructure defaultStructure = new FeeStructure();
            defaultStructure.setAmount(0.0);
            return Objects.requireNonNull(defaultStructure);
        });

        Fee fee;
        if (existingFee.isPresent()) {
            fee = existingFee.get();
        } else {
            fee = new Fee();
            fee.setStudentId(studentId);
            fee.setRegisterNumber(student.getRegisterNumber());
            fee.setDepartment(student.getDepartment());
            fee.setYear(year);
            fee.setSemester(semester);
        }

        fee.setTotalAmount(structure.getAmount());
        fee.setPendingAmount(fee.getTotalAmount() - fee.getPaidAmount());

        return feeRepository.save(fee);
    }
}
