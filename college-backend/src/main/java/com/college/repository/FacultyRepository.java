package com.college.repository;

import com.college.model.Faculty;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends MongoRepository<Faculty, String> {
    Optional<Faculty> findByFacultyId(String facultyId);
    List<Faculty> findByDepartment(String department);
    Optional<Faculty> findByUserId(String userId);
    boolean existsByFacultyId(String facultyId);
}
