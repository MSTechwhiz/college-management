package com.college.repository;

import com.college.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface SubjectRepository extends MongoRepository<Subject, String> {
    Optional<Subject> findBySubjectCode(String subjectCode);

    List<Subject> findByDepartmentAndSemester(String department, int semester);
}
