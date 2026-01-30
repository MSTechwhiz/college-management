package com.college.controller;

import com.college.annotation.AuditAction;
import com.college.model.Fee;
import com.college.model.FeeStructure;
import com.college.service.FeeService;
import com.college.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "http://localhost:3000")
public class FeeController {

    @Autowired
    private FeeService feeService;
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fee>> getAllFees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String feeType,
            @RequestParam(required = false) String status) {
        if (search != null || department != null || feeType != null || status != null) {
            return ResponseEntity.ok(feeService.searchFees(search, department, feeType, status));
        }
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<Fee>> getFeesByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getFeesByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<com.college.model.PaymentRecord>> getStudentPaymentHistory(
            @PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getStudentPaymentHistory(studentId));
    }

    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getFeesSummary(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getFeesSummary(studentId));
    }

    @GetMapping("/student/{studentId}/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<Fee>> getPendingFeesByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getPendingFeesByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<Fee>> getPaidFeesByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getPaidFeesByStudent(studentId));
    }

    @GetMapping("/department/{department}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDepartmentFeesSummary(@PathVariable String department) {
        return ResponseEntity.ok(feeService.getDepartmentFeesSummary(department));
    }

    @GetMapping("/department/{department}/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fee>> getPendingFeesByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(feeService.getPendingFeesByDepartment(department));
    }

    @GetMapping("/department/{department}/paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fee>> getPaidFeesByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(feeService.getPaidFeesByDepartment(department));
    }

    @GetMapping("/type/{feeType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fee>> getFeesByType(@PathVariable String feeType) {
        return ResponseEntity.ok(feeService.getFeesByType(feeType));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "GENERATE_FEES", resource = "Fee")
    public ResponseEntity<List<Fee>> generateFees(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        int year = Integer.parseInt(body.get("year").toString());
        int semester = Integer.parseInt(body.get("semester").toString());
        return ResponseEntity.ok(feeService.generateFees(studentId, year, semester));
    }

    @PostMapping("/structure")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "CREATE_FEE_STRUCTURE", resource = "FeeStructure")
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        return ResponseEntity.ok(feeService.createFeeStructure(feeStructure));
    }

    @GetMapping("/structure")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeService.getAllFeeStructures());
    }

    @DeleteMapping("/structure/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "DELETE_FEE_STRUCTURE", resource = "FeeStructure", targetIdExpression = "#id")
    public ResponseEntity<Void> deleteFeeStructure(@PathVariable String id) {
        feeService.deleteFeeStructure(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{feeId}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fee> overrideFee(@PathVariable String feeId, @RequestBody Map<String, Object> request,
            Authentication authentication) {
        double amount = Double.parseDouble(request.get("amount").toString());
        String reason = request.get("reason").toString();
        Fee fee = feeService.overrideFee(feeId, amount, reason, authentication.getName());
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "FEE_OVERRIDE", fee.getId(), null);
        return ResponseEntity.ok(fee);
    }

    @GetMapping("/{feeId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<com.college.model.PaymentRecord>> getPaymentHistory(@PathVariable String feeId) {
        return ResponseEntity.ok(feeService.getPaymentHistory(feeId));
    }

    @PostMapping("/{feeId}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "PROCESS_PAYMENT", resource = "Fee", targetIdExpression = "#feeId")
    public ResponseEntity<Fee> pay(@PathVariable String feeId, @RequestBody Map<String, Object> request,
            Authentication authentication) {
        double amount = Double.parseDouble(request.get("amount").toString());
        String method = request.get("method") != null ? request.get("method").toString() : "CASH";
        Fee fee = feeService.makePayment(feeId, amount, method, authentication.getName());
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "FEE_PAYMENT", fee.getId(), null);
        return ResponseEntity.ok(fee);
    }
    
    @PostMapping("/{feeId}/installments")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "DEFINE_INSTALLMENTS", resource = "Fee", targetIdExpression = "#feeId")
    public ResponseEntity<Fee> defineInstallments(@PathVariable String feeId,
            @RequestBody List<Map<String, Object>> items,
            Authentication authentication) {
        Fee fee = feeService.defineInstallmentPlan(feeId, items, authentication.getName());
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DEFINE_INSTALLMENTS", fee.getId(), null);
        return ResponseEntity.ok(fee);
    }
    
    @GetMapping("/{feeId}/installments")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<List<Fee.Installment>> getInstallments(@PathVariable String feeId) {
        return ResponseEntity.ok(feeService.getInstallments(feeId));
    }
    
    @PostMapping("/{feeId}/installments/{index}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "PROCESS_INSTALLMENT_PAYMENT", resource = "Fee", targetIdExpression = "#feeId")
    public ResponseEntity<Fee> payInstallment(@PathVariable String feeId, @PathVariable int index,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        double amount = Double.parseDouble(request.get("amount").toString());
        String method = request.get("method") != null ? request.get("method").toString() : "CASH";
        String idempotencyKey = request.get("idempotencyKey") != null ? request.get("idempotencyKey").toString() : null;
        Fee fee = feeService.makeInstallmentPaymentWithIdempotency(feeId, index, amount, method, authentication.getName(), idempotencyKey);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "FEE_INSTALLMENT_PAYMENT", fee.getId(), null);
        return ResponseEntity.ok(fee);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportFees() {
        List<Fee> fees = feeService.getAllFees();
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Fees");
            Row header = sheet.createRow(0);
            String[] cols = { "ID", "RegisterNumber", "Department", "Year", "Semester", "Total", "Paid", "Pending",
                    "Status" };
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
            }
            int r = 1;
            for (Fee f : fees) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(f.getId());
                row.createCell(1).setCellValue(f.getRegisterNumber() != null ? f.getRegisterNumber() : "");
                row.createCell(2).setCellValue(f.getDepartment() != null ? f.getDepartment() : "");
                row.createCell(3).setCellValue(f.getYear());
                row.createCell(4).setCellValue(f.getSemester());
                row.createCell(5).setCellValue(f.getTotalAmount());
                row.createCell(6).setCellValue(f.getPaidAmount());
                row.createCell(7).setCellValue(f.getPendingAmount());
                row.createCell(8).setCellValue(f.getStatus() != null ? f.getStatus() : "PENDING");
            }
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            wb.write(out);
            byte[] bytes = out.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "fees.xlsx");
            return ResponseEntity.ok().headers(headers).body(bytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "UPDATE_FEE", resource = "Fee", targetIdExpression = "#id")
    public ResponseEntity<Fee> updateFee(@PathVariable String id, @Valid @RequestBody Fee fee,
            Authentication authentication) {
        Fee updated = feeService.updateFeeManual(id, fee);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "UPDATE_FEE", id, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "DELETE_FEE", resource = "Fee", targetIdExpression = "#id")
    public ResponseEntity<Void> deleteFee(@PathVariable String id, Authentication authentication) {
        feeService.deleteFee(id);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DELETE_FEE", id, null);
        return ResponseEntity.ok().build();
    }
}
