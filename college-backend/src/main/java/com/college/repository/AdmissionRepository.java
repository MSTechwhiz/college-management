package com.college.repository;

import com.college.model.Admission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends MongoRepository<Admission, String> {
    List<Admission> findByDepartment(String department);
    Optional<Admission> findByRegisterNumber(String registerNumber);
}
