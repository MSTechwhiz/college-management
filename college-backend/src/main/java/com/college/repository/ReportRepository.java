package com.college.repository;

import com.college.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByStudentId(String studentId);
    List<Report> findByStatus(String status);
    List<Report> findByCategoryAndStatus(String category, String status);
    List<Report> findByAssignedTo(String assignedTo);
}
