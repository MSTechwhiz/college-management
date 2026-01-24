package com.college.repository;

import com.college.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    List<Department> findByNameContainingIgnoreCase(String name);
}
