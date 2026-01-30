package com.college.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Service
public class MockPaymentGatewayService implements PaymentGatewayService {

    private static final String SECRET_KEY = "mock_secret_key_change_in_production";
    private static final String MOCK_GATEWAY_URL = "http://localhost:3000/mock-payment"; // Frontend mock page

    @Override
    public Map<String, Object> initiatePayment(String feeId, double amount, String studentId, String returnUrl) {
        String transactionId = "TXN_" + UUID.randomUUID().toString();
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("amount", amount);
        response.put("currency", "INR");
        response.put("status", "CREATED");
        
        // Generate signature for security
        String payload = transactionId + amount + feeId + studentId;
        String signature = generateSignature(payload);
        response.put("signature", signature);
        
        // Construct payment URL (in a real scenario, this comes from the gateway)
        String paymentUrl = MOCK_GATEWAY_URL + "?txnId=" + transactionId + 
                           "&amount=" + amount + 
                           "&feeId=" + feeId + 
                           "&returnUrl=" + returnUrl;
        response.put("paymentUrl", paymentUrl);
        
        return response;
    }

    @Override
    public Map<String, Object> verifyPayment(String transactionId) {
        // In a real implementation, this would call the gateway's API
        // For mock, we simulate verification based on transaction ID format
        
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        
        if (transactionId != null && transactionId.startsWith("TXN_")) {
            response.put("status", "SUCCESS");
            response.put("verifiedAt", LocalDateTime.now());
            response.put("message", "Payment verified successfully");
        } else {
            response.put("status", "FAILED");
            response.put("message", "Invalid transaction ID");
        }
        
        return response;
    }

    @Override
    public boolean validateSignature(Map<String, String> params, String signature) {
        // Simple mock validation
        return true; 
    }
    
    private String generateSignature(String payload) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            return Base64.getEncoder().encodeToString(sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }
}
