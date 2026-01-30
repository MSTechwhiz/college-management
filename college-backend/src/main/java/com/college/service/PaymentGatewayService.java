package com.college.service;

import java.util.Map;

public interface PaymentGatewayService {
    Map<String, Object> initiatePayment(String feeId, double amount, String studentId, String returnUrl);
    Map<String, Object> verifyPayment(String transactionId);
    boolean validateSignature(Map<String, String> params, String signature);
}
