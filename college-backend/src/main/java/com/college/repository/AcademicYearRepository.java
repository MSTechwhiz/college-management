package com.college.repository;

import com.college.model.AcademicYear;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AcademicYearRepository extends MongoRepository<AcademicYear, String> {
    Optional<AcademicYear> findByName(String name);

    Optional<AcademicYear> findByCurrentYearTrue();

    boolean existsByName(String name);
}
