package com.college.repository;

import com.college.model.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRepository extends MongoRepository<Fee, String> {
    List<Fee> findByStudentId(String studentId);
    Optional<Fee> findByStudentIdAndYearAndSemester(String studentId, int year, int semester);
    List<Fee> findByDepartment(String department);
}
