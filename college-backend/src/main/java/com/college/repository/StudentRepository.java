package com.college.repository;

import com.college.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByRegisterNumber(String registerNumber);
    List<Student> findByDepartment(String department);
    List<Student> findByDepartmentAndYear(String department, int year);
    Optional<Student> findByUserId(String userId);
    boolean existsByRegisterNumber(String registerNumber);
}
