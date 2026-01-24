package com.college.repository;

import com.college.model.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRepository extends MongoRepository<Fee, String> {
    List<Fee> findByStudentId(String studentId);
    List<Fee> findByStudentIdAndYearAndSemester(String studentId, int year, int semester);
    Optional<Fee> findByStudentIdAndYearAndSemesterAndFeeType(String studentId, int year, int semester, String feeType);
    List<Fee> findByDepartment(String department);
    List<Fee> findByRegisterNumber(String registerNumber);
    List<Fee> findByRegisterNumberAndDepartment(String registerNumber, String department);
    List<Fee> findByFeeType(String feeType);
    List<Fee> findByStatus(String status);
}
