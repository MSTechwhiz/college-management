package com.college.service;

import com.college.model.AcademicYear;
import com.college.model.Batch;
import com.college.model.Student;
import com.college.repository.AcademicYearRepository;
import com.college.repository.BatchRepository;
import com.college.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AcademicService {

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Academic Year Management

    public List<AcademicYear> getAllYears() {
        return academicYearRepository.findAll();
    }

    public AcademicYear createYear(AcademicYear year) {
        if (academicYearRepository.existsByName(year.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Academic Year already exists");
        }
        if (year.isCurrentYear()) {
            // Unset previous current year
            Optional<AcademicYear> current = academicYearRepository.findByCurrentYearTrue();
            current.ifPresent(y -> {
                y.setCurrentYear(false);
                y.setStatus("ARCHIVED");
                academicYearRepository.save(y);
            });
            year.setStatus("ACTIVE");
        } else {
            year.setStatus("UPCOMING");
        }
        return academicYearRepository.save(year);
    }

    public AcademicYear getCurrentYear() {
        return academicYearRepository.findByCurrentYearTrue()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active academic year found"));
    }

    // Batch Management

    public List<Batch> getBatchesByYear(String academicYearId) {
        return batchRepository.findByAcademicYearId(academicYearId);
    }

    public Batch createBatch(Batch batch) {
        // Validate academic year
        if (!academicYearRepository.existsById(batch.getAcademicYearId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Academic Year ID");
        }
        return batchRepository.save(batch);
    }

    // Promotion Logic (Basic)
    @Transactional
    public void promoteStudents(String fromYearId, String toYearId) {
        // Logic to move students from one academic context to another
        // This is complex and requires careful implementation
        // For now, placeholder or basic increment logic

        AcademicYear toYear = academicYearRepository.findById(toYearId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target year not found"));

        // Example: Increment year for all non-final year students
        // Real implementation requires batch-specific logic
    }
}
