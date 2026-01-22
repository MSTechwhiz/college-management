package com.college.repository;

import com.college.model.Mark;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends MongoRepository<Mark, String> {
    List<Mark> findByStudentId(String studentId);
    Optional<Mark> findByStudentIdAndSubject(String studentId, String subject);
    List<Mark> findBySubject(String subject);
}
