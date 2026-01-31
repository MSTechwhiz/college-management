package com.college.repository;

import com.college.model.Batch;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BatchRepository extends MongoRepository<Batch, String> {
    List<Batch> findByDepartment(String department);

    List<Batch> findByAcademicYearId(String academicYearId);
}
