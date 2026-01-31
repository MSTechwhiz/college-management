package com.college.repository;

import com.college.model.GPA;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface GPARepository extends MongoRepository<GPA, String> {
    Optional<GPA> findByStudentIdAndSemester(String studentId, int semester);

    List<GPA> findByStudentId(String studentId);
}
