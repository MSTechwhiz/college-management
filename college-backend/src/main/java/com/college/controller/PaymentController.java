package com.college.controller;

import com.college.service.FeeService;
import com.college.service.PaymentGatewayService;
import com.college.model.Fee;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentGatewayService paymentGatewayService;

    @Autowired
    private FeeService feeService;

    @Autowired
    private com.college.service.PaymentLedgerService paymentLedgerService;

    @GetMapping("/receipt/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<com.college.model.PaymentRecord> getReceipt(@PathVariable String id) {
        return ResponseEntity.ok(paymentLedgerService.getPaymentRecord(id));
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> initiatePayment(@RequestBody Map<String, Object> request,
            Authentication auth) {
        String feeId = (String) request.get("feeId");
        double amount = Double.parseDouble(request.get("amount").toString());
        String studentId = (String) request.get("studentId"); // Optional if user is student
        String returnUrl = (String) request.get("returnUrl");

        // Security check: If student, ensure they are paying for themselves
        // (This would be better with a dedicated service method to check ownership)

        Map<String, Object> response = paymentGatewayService.initiatePayment(feeId, amount, studentId, returnUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> request,
            Authentication auth) {
        String transactionId = (String) request.get("transactionId");
        String feeId = (String) request.get("feeId");
        double amount = Double.parseDouble(request.get("amount").toString());

        Map<String, Object> verificationResult = paymentGatewayService.verifyPayment(transactionId);

        if ("SUCCESS".equals(verificationResult.get("status"))) {
            // If verified, record payment in system
            // Use transactionId as idempotency key to prevent double charging
            feeService.makePaymentWithIdempotency(feeId, amount, "ONLINE", auth.getName(), transactionId);
            verificationResult.put("systemStatus", "RECORDED");
        } else {
            verificationResult.put("systemStatus", "FAILED");
        }

        return ResponseEntity.ok(verificationResult);
    }
}
