package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private FeeStateService feeStateService;

    @Autowired
    private PaymentLedgerService paymentLedgerService;

    private static final List<String> VALID_FEE_TYPES = List.of("Tuition", "Exam", "Bus", "Hostel", "Other");
    private static final List<String> VALID_STATUS = List.of("PENDING", "PARTIAL", "PAID");

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public List<Fee> getFeesByStudent(String studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    @Transactional
    public FeeStructure createFeeStructure(FeeStructure feeStructure) {
        if (feeStructure.getFeeType() != null && !VALID_FEE_TYPES.contains(feeStructure.getFeeType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid fee type: " + feeStructure.getFeeType()
                    + ". Valid types: " + String.join(", ", VALID_FEE_TYPES));
        }
        return feeStructureRepository.save(feeStructure);
    }

    public List<FeeStructure> getAllFeeStructures() {
        return feeStructureRepository.findAll();
    }

    @Transactional
    public Fee overrideFee(String feeId, double amount, String reason, String adminId) {
        // 1. VALIDATION - INPUT
        if (feeId == null || feeId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee ID cannot be null or empty");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reason cannot be null or empty");
        }

        if (adminId == null || adminId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin ID cannot be null or empty");
        }

        feeStateService.validateFeeAmount(amount, "Override");

        // 2. LOAD FEE
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));

        // 3. STATE MACHINE CHECK - Only allow overrides on certain statuses
        FeeStatus currentStatus = FeeStatus.fromLegacyString(fee.getStatus());

        // Cannot override fees that are already fully paid
        if (feeStateService.isTerminalState(currentStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot override fee in terminal state: " + currentStatus.name());
        }

        // 4. RECORD OVERRIDE
        Fee.FeeOverride override = new Fee.FeeOverride();
        override.setAmount(amount);
        override.setReason(reason);
        override.setAdminId(adminId);
        override.setTimestamp(java.time.LocalDateTime.now().toString());

        if (fee.getOverrides() == null) {
            fee.setOverrides(new java.util.ArrayList<>());
        }
        fee.getOverrides().add(override);

        // 5. RECALCULATE TOTAL AMOUNT
        double oldTotal = fee.getTotalAmount();
        double newTotal = oldTotal + amount;

        // 6. VALIDATE NEW TOTAL
        if (newTotal < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Override would result in negative total amount");
        }

        fee.setTotalAmount(newTotal);

        // 7. RECALCULATE DERIVED BALANCES (using state service)
        double newPendingAmount = feeStateService.calculatePendingAmount(newTotal, fee.getPaidAmount());
        fee.setPendingAmount(newPendingAmount);

        // 8. RECALCULATE STATUS based on new balance
        FeeStatus newStatus = feeStateService.calculateStatus(fee.getTotalAmount(), fee.getPaidAmount());

        // 9. VALIDATE STATE TRANSITION
        feeStateService.validateStateTransition(currentStatus, newStatus);

        // 10. UPDATE STATUS
        fee.setStatus(newStatus.toLegacyString());

        // 11. PERSIST
        return feeRepository.save(fee);
    }

    @Transactional
    public List<Fee> generateFees(String studentId, int year, int semester) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID cannot be null or empty");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        String department = student.getDepartment();
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalStateException("Student department is null or empty");
        }

        List<FeeStructure> structures = feeStructureRepository
                .findByDepartmentAndYearAndSemester(department, year, semester);

        if (structures.isEmpty()) {
            // No structure defined. Create a default "Tuition" fee?
            // Or maybe just return empty list.
            // Let's create a default Tuition fee of 0 if nothing defined, to ensure record
            // exists.
            FeeStructure defaultStructure = new FeeStructure();
            defaultStructure.setAmount(0.0);
            defaultStructure.setFeeType("Tuition");
            defaultStructure.setDepartment(department);
            defaultStructure.setYear(year);
            defaultStructure.setSemester(semester);
            structures = java.util.Collections.singletonList(defaultStructure);
        }

        List<Fee> fees = new java.util.ArrayList<>();

        for (FeeStructure structure : structures) {
            String feeType = structure.getFeeType() != null ? structure.getFeeType() : "Tuition";

            Optional<Fee> existingFee = feeRepository.findByStudentIdAndYearAndSemesterAndFeeType(studentId, year,
                    semester, feeType);

            Fee fee;
            if (existingFee.isPresent()) {
                fee = existingFee.get();
                // Optionally update amount if structure changed?
                // Usually we don't update generated fees automatically to avoid overwriting
                // overrides.
                // But if amount is 0, maybe we update it.
                // For now, skip updating existing fees.
            } else {
                fee = new Fee();
                fee.setStudentId(studentId);
                fee.setRegisterNumber(student.getRegisterNumber());
                fee.setDepartment(student.getDepartment());
                fee.setYear(year);
                fee.setSemester(semester);
                fee.setFeeType(feeType);
                feeStateService.validateFeeType(feeType);
                fee.setBreakdown(structure.getBreakdown());
                fee.setPaidAmount(0.0);
                fee.setDueDate(java.time.LocalDateTime.now().plusDays(30));
                fee.setCreatedDate(LocalDateTime.now());

                double baseAmount = structure.getAmount();
                double finalAmount = baseAmount;

                if ("Tuition".equalsIgnoreCase(feeType)) {
                    finalAmount = applyScholarshipDiscount(studentId, baseAmount);
                }

                fee.setTotalAmount(finalAmount);

                // Initialize fee in CREATED state (will transition to PENDING on first access)
                fee.setStatus(FeeStatus.CREATED.toLegacyString());
                fee.setPendingAmount(feeStateService.calculatePendingAmount(finalAmount, 0.0));
                fee = feeRepository.save(fee);
            }
            fees.add(fee);
        }
        return fees;
    }

    // Removed unused createOrUpdateFee (replaced by generateFees)

    public List<Fee> searchFees(String keyword, String department, String feeType) {
        // Validate feeType if provided
        if (feeType != null && !feeType.isEmpty() && !VALID_FEE_TYPES.contains(feeType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid fee type: " + feeType + ". Valid types: " + String.join(", ", VALID_FEE_TYPES));
        }

        List<Fee> allFees;

        // Search by department if specified
        if (department != null && !department.isEmpty()) {
            allFees = feeRepository.findByDepartment(department);
        } else {
            allFees = feeRepository.findAll();
        }

        java.util.stream.Stream<Fee> stream = allFees.stream();

        // Filter by fee type if specified
        if (feeType != null && !feeType.isEmpty()) {
            stream = stream.filter(f -> f.getFeeType() != null && f.getFeeType().equalsIgnoreCase(feeType));
        }

        // Search by keyword (student name, register number, or department)
        if (keyword != null && !keyword.isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();

            // Find students by name
            List<String> studentIdsByName = studentRepository.findAll().stream()
                    .filter(s -> s.getFullName() != null && s.getFullName().toLowerCase().contains(lowerKeyword))
                    .map(Student::getId)
                    .collect(java.util.stream.Collectors.toList());

            // Filter fees by register number, student name, or department
            stream = stream.filter(
                    f -> (f.getRegisterNumber() != null && f.getRegisterNumber().toLowerCase().contains(lowerKeyword))
                            ||
                            (f.getDepartment() != null && f.getDepartment().toLowerCase().contains(lowerKeyword)) ||
                            studentIdsByName.contains(f.getStudentId()));
        }

        return stream.collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> getFeesSummary(String studentId) {
        List<Fee> fees = feeRepository.findByStudentId(studentId);

        Map<String, Object> summary = new HashMap<>();
        double totalFees = 0.0;
        double paidFees = 0.0;
        double pendingFees = 0.0;

        for (Fee fee : fees) {
            totalFees += fee.getTotalAmount();
            paidFees += fee.getPaidAmount();
            pendingFees += fee.getPendingAmount();
        }

        summary.put("totalFees", totalFees);
        summary.put("paidFees", paidFees);
        summary.put("pendingFees", pendingFees);
        summary.put("feeCount", fees.size());

        // Group by status
        Map<String, Long> byStatus = fees.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        f -> f.getStatus() != null ? f.getStatus() : "UNKNOWN",
                        java.util.stream.Collectors.counting()));
        summary.put("byStatus", byStatus);

        // Group by fee type
        Map<String, Long> byType = fees.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        f -> f.getFeeType() != null ? f.getFeeType() : "UNKNOWN",
                        java.util.stream.Collectors.counting()));
        summary.put("byFeeType", byType);

        return summary;
    }

    public Map<String, Object> getDepartmentFeesSummary(String department) {
        List<Fee> fees = feeRepository.findByDepartment(department);

        Map<String, Object> summary = new HashMap<>();
        double totalFees = 0.0;
        double paidFees = 0.0;
        double pendingFees = 0.0;

        for (Fee fee : fees) {
            totalFees += fee.getTotalAmount();
            paidFees += fee.getPaidAmount();
            pendingFees += fee.getPendingAmount();
        }

        summary.put("totalFees", totalFees);
        summary.put("paidFees", paidFees);
        summary.put("pendingFees", pendingFees);
        summary.put("studentCount", fees.stream().map(Fee::getStudentId).distinct().count());

        return summary;
    }

    public Fee makePayment(String feeId, double amount, String method, String adminId) {
        return makePaymentWithIdempotency(feeId, amount, method, adminId, null);
    }

    /**
     * Make a payment with full safety checks:
     * - State machine validation
     * - Idempotency (duplicate detection)
     * - Race condition prevention
     * - Immutable ledger recording
     * - Derived balance calculation
     */
    public synchronized Fee makePaymentWithIdempotency(String feeId, double amount, String method,
            String adminId, String idempotencyKey) {
        // 1. VALIDATION
        feeStateService.validateFeeAmount(amount, "Payment");
        feeStateService.validatePaymentMethod(method);

        if (adminId == null || adminId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin ID cannot be empty");
        }

        // 2. LOAD FEE (with fresh read to prevent stale data)
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));

        // 3. IDEMPOTENCY CHECK
        if (idempotencyKey == null) {
            idempotencyKey = paymentLedgerService.generateIdempotencyKey(feeId, amount, method);
        }

        Optional<PaymentRecord> existingPayment = paymentLedgerService.findByIdempotencyKey(idempotencyKey);
        if (existingPayment.isPresent()) {
            // Idempotent response: return fee with same payment applied
            return fee;
        }

        // 4. STATE MACHINE VALIDATION
        FeeStatus currentStatus = FeeStatus.fromLegacyString(fee.getStatus());
        if (!feeStateService.canAcceptPayments(currentStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot accept payments in " + currentStatus.name() + " status");
        }

        // 5. CALCULATE NEW BALANCE
        double balanceBefore = fee.getPaidAmount();
        double newPaidAmount = balanceBefore + amount;

        // 6. VALIDATE PAYMENT DOES NOT EXCEED TOTAL
        if (newPaidAmount > fee.getTotalAmount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Payment would exceed total. Max allowed: %.2f, requested: %.2f",
                            (fee.getTotalAmount() - balanceBefore), amount));
        }

        // 7. CALCULATE NEW STATUS
        FeeStatus newStatus = feeStateService.calculateStatus(fee.getTotalAmount(), newPaidAmount);

        // 8. VALIDATE STATE TRANSITION
        feeStateService.validateStateTransition(currentStatus, newStatus);

        // 9. RECORD IN IMMUTABLE LEDGER FIRST (before modifying fee)
        PaymentRecord ledgerRecord = paymentLedgerService.recordPayment(
                feeId, fee.getStudentId(), fee.getRegisterNumber(), fee.getDepartment(),
                amount, method, adminId, idempotencyKey,
                currentStatus, newStatus,
                balanceBefore, newPaidAmount);

        // 10. UPDATE FEE (add to payments list, update derived balances)
        if (fee.getPayments() == null) {
            fee.setPayments(new java.util.ArrayList<>());
        }

        Fee.Payment payment = new Fee.Payment();
        payment.setAmount(amount);
        payment.setMethod(method);
        payment.setAdminId(adminId);
        payment.setTimestamp(LocalDateTime.now().toString());
        fee.getPayments().add(payment);

        // 11. UPDATE DERIVED BALANCES (calculated, not stored separately)
        fee.setPaidAmount(newPaidAmount);
        fee.setPendingAmount(feeStateService.calculatePendingAmount(fee.getTotalAmount(), newPaidAmount));

        // 12. UPDATE STATUS AND CONCURRENCY TRACKING
        fee.setStatus(newStatus.toLegacyString());
        fee.setLastProcessedPaymentId(ledgerRecord.getId());
        fee.setLastProcessedVersion(fee.getLastProcessedVersion() + 1);
        fee.setLastPaymentProcessedAt(LocalDateTime.now());

        // 13. PERSIST FEE
        Fee updatedFee = feeRepository.save(fee);

        // 14. VALIDATE LEDGER CONSISTENCY
        paymentLedgerService.validateLedgerConsistency(updatedFee, updatedFee.getPaidAmount());

        return updatedFee;
    }

    /**
     * DEPRECATED: Use feeStateService.calculateStatus() instead
     * This method kept for backward compatibility only
     */
    private void updateStatus(Fee fee) {
        FeeStatus newStatus = feeStateService.calculateStatus(fee.getTotalAmount(), fee.getPaidAmount());
        fee.setStatus(newStatus.toLegacyString());
    }

    private double applyScholarshipDiscount(String studentId, double amount) {
        List<Mark> marks = markRepository.findByStudentId(studentId);
        if (marks == null || marks.isEmpty()) {
            return amount;
        }
        double avg = marks.stream().mapToDouble(m -> m.getTotalMarks()).average().orElse(0.0);
        double cgpa = avg / 10.0; // convert 0-100 marks to 0-10 scale
        if (cgpa >= 7.5) {
            return amount * 0.5;
        }
        return amount;
    }

    public Fee updateFeeManual(String id, Fee feeUpdates) {
        Fee existing = feeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));

        if (feeUpdates.getTotalAmount() > 0) {
            existing.setTotalAmount(feeUpdates.getTotalAmount());
            existing.setPendingAmount(Math.max(0, existing.getTotalAmount() - existing.getPaidAmount()));
            updateStatus(existing);
        }
        return feeRepository.save(existing);
    }

    public void deleteFee(String id) {
        if (!feeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found");
        }
        feeRepository.deleteById(id);
    }
}
