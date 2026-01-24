package com.college.repository;

import com.college.model.FeeStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends MongoRepository<FeeStructure, String> {
    List<FeeStructure> findByDepartmentAndYearAndSemester(String department, int year, int semester);
    Optional<FeeStructure> findByDepartmentAndYearAndSemesterAndFeeType(String department, int year, int semester, String feeType);
}
