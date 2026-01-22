package com.college.controller;

import com.college.model.Fee;
import com.college.model.FeeStructure;
import com.college.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "http://localhost:3000")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fee>> getAllFees() {
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<List<Fee>> getFeesByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getFeesByStudent(studentId));
    }

    @PostMapping("/structure")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        return ResponseEntity.ok(feeService.createFeeStructure(feeStructure));
    }

    @GetMapping("/structure")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeService.getAllFeeStructures());
    }

    @PostMapping("/{feeId}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> overrideFee(@PathVariable String feeId, @RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            double amount = Double.parseDouble(request.get("amount").toString());
            String reason = request.get("reason").toString();
            Fee fee = feeService.overrideFee(feeId, amount, reason, authentication.getName());
            return ResponseEntity.ok(fee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
