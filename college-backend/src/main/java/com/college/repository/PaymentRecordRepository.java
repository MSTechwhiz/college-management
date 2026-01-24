package com.college.repository;

import com.college.model.PaymentRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends MongoRepository<PaymentRecord, String> {
    List<PaymentRecord> findByFeeId(String feeId);

    List<PaymentRecord> findByStudentId(String studentId);

    List<PaymentRecord> findByStudentIdAndDepartment(String studentId, String department);

    Optional<PaymentRecord> findByIdempotencyKey(String idempotencyKey);

    List<PaymentRecord> findByStudentIdOrderByProcessedAtDesc(String studentId);
}
