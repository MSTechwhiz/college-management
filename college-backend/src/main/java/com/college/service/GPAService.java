package com.college.service;

import com.college.model.GPA;
import com.college.model.Mark;
import com.college.repository.GPARepository;
import com.college.repository.MarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GPAService {

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private GPARepository gpaRepository;

    @Transactional
    public GPA calculateAndSaveGPA(String studentId, int semester) {
        List<Mark> marks = markRepository.findByStudentId(studentId).stream()
                .filter(m -> m.getSemester() == semester)
                .collect(Collectors.toList());

        if (marks.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No marks found for student " + studentId + " in semester " + semester);
        }

        // Validate all marks have grades and credits
        for (Mark mark : marks) {
            if (mark.getGrade() == null || mark.getGrade().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mark for subject " + mark.getSubject() + " does not have a grade assigned");
            }
            if (mark.getCredits() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mark for subject " + mark.getSubject() + " does not have credits assigned");
            }
        }

        // Calculate GPA
        double totalGradePoints = 0.0;
        int totalCredits = 0;

        for (Mark mark : marks) {
            double gradePoint = gradeToPoints(mark.getGrade());
            mark.setGradePoints(gradePoint);
            markRepository.save(mark);

            totalGradePoints += gradePoint * mark.getCredits();
            totalCredits += mark.getCredits();
        }

        double sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0.0;

        // Calculate CGPA
        double cgpa = calculateCGPA(studentId, semester);

        // Save or update GPA record
        GPA gpaRecord = gpaRepository.findByStudentIdAndSemester(studentId, semester)
                .orElse(new GPA());

        gpaRecord.setStudentId(studentId);
        gpaRecord.setSemester(semester);
        gpaRecord.setSemesterGPA(sgpa);
        gpaRecord.setCumulativeCGPA(cgpa);
        gpaRecord.setTotalCredits(totalCredits);
        gpaRecord.setEarnedCredits(totalCredits);
        gpaRecord.setStatus("DRAFT");
        gpaRecord.setCalculatedAt(LocalDateTime.now());

        return gpaRepository.save(gpaRecord);
    }

    public double calculateCGPA(String studentId, int upToSemester) {
        List<GPA> allGPAs = gpaRepository.findByStudentId(studentId).stream()
                .filter(g -> g.getSemester() <= upToSemester)
                .collect(Collectors.toList());

        if (allGPAs.isEmpty()) {
            return 0.0;
        }

        double totalWeightedGPA = 0.0;
        int totalCredits = 0;

        for (GPA gpa : allGPAs) {
            totalWeightedGPA += gpa.getSemesterGPA() * gpa.getTotalCredits();
            totalCredits += gpa.getTotalCredits();
        }

        return totalCredits > 0 ? totalWeightedGPA / totalCredits : 0.0;
    }

    public GPA getStudentGPA(String studentId, int semester) {
        return gpaRepository.findByStudentIdAndSemester(studentId, semester)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "GPA record not found for student " + studentId + " in semester " + semester));
    }

    public List<GPA> getAllStudentGPAs(String studentId) {
        return gpaRepository.findByStudentId(studentId);
    }

    @Transactional
    public GPA finalizeGPA(String studentId, int semester) {
        GPA gpaRecord = getStudentGPA(studentId, semester);

        if ("FINAL".equals(gpaRecord.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "GPA for semester " + semester + " is already finalized");
        }

        gpaRecord.setStatus("FINAL");
        return gpaRepository.save(gpaRecord);
    }

    private double gradeToPoints(String grade) {
        if (grade == null || grade.isEmpty()) {
            return 0.0;
        }

        switch (grade.toUpperCase()) {
            case "O":
            case "A+":
                return 10.0;
            case "A":
                return 9.0;
            case "B+":
                return 8.0;
            case "B":
                return 7.0;
            case "C":
                return 6.0;
            case "D":
                return 5.0;
            case "E":
            case "F":
                return 0.0;
            default:
                return 0.0;
        }
    }
}
