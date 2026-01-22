package com.college.repository;

import com.college.model.FeeStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeeStructureRepository extends MongoRepository<FeeStructure, String> {
    Optional<FeeStructure> findByDepartmentAndYearAndSemester(String department, int year, int semester);
}
