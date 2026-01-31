package com.college.service;

import com.college.model.Mark;
import com.college.model.Student;
import com.college.model.Faculty;
import com.college.model.User;
import com.college.repository.MarkRepository;
import com.college.repository.StudentRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.college.repository.SubjectRepository subjectRepository;

    @Autowired
    private GPAService gpaService;

    public Mark createOrUpdateMark(Mark mark, String facultyUsername) {
        if (mark.getStudentId() == null || mark.getStudentId().trim().isEmpty()) {
            throw new RuntimeException("studentId is required");
        }
        if (mark.getSubject() == null || mark.getSubject().trim().isEmpty()) {
            throw new RuntimeException("subject is required");
        }

        User user = userRepository.findByUsername(facultyUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Faculty not found for user"));

        Student student = studentRepository.findById(mark.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!faculty.getDepartment().equals(student.getDepartment())) {
            throw new RuntimeException("You are not authorized to modify marks for this student");
        }
        if (faculty.getSubjects() != null && !faculty.getSubjects().isEmpty()) {
            if (!faculty.getSubjects().contains(mark.getSubject())) {
                throw new RuntimeException("You are not authorized to modify marks for this subject");
            }
        }

        Optional<Mark> existing = markRepository.findByStudentIdAndSubject(mark.getStudentId(), mark.getSubject());

        Mark markToSave;
        if (existing.isPresent()) {
            markToSave = existing.get();
            if (markToSave.isLocked()) {
                throw new RuntimeException("Marks are locked and cannot be edited");
            }
        } else {
            markToSave = new Mark();
            markToSave.setStudentId(mark.getStudentId());
            markToSave.setRegisterNumber(mark.getRegisterNumber());
            markToSave.setSubject(mark.getSubject());
        }

        markToSave.setCaMarks(mark.getCaMarks());
        markToSave.setModelMarks(mark.getModelMarks());
        markToSave.setPracticalMarks(mark.getPracticalMarks());

        double total = mark.getCaMarks() + mark.getModelMarks() + mark.getPracticalMarks();
        markToSave.setTotalMarks(total);

        String grade = calculateGrade(total);
        markToSave.setGrade(grade);

        // Auto-populate credits and semester from Subject if subjectCode is provided
        if (mark.getSubjectCode() != null && !mark.getSubjectCode().isEmpty()) {
            markToSave.setSubjectCode(mark.getSubjectCode());
            subjectRepository.findBySubjectCode(mark.getSubjectCode()).ifPresent(subject -> {
                markToSave.setCredits(subject.getCredits());
                markToSave.setSemester(subject.getSemester());
            });
        }

        // Calculate grade points from grade
        markToSave.setGradePoints(gradeToPoints(grade));

        markToSave.setFacultyId(faculty.getFacultyId());
        markToSave.setLocked(true);

        return markRepository.save(markToSave);
    }

    public void triggerGPACalculation(String studentId, int semester) {
        try {
            gpaService.calculateAndSaveGPA(studentId, semester);
        } catch (Exception e) {
            System.err.println("GPA calculation failed for student " + studentId + ", semester " + semester + ": "
                    + e.getMessage());
        }
    }

    public List<Mark> getMarksByStudent(String studentId) {
        return markRepository.findByStudentId(studentId);
    }

    public Mark getMarkByStudentAndSubject(String studentId, String subject) {
        return markRepository.findByStudentIdAndSubject(studentId, subject)
                .orElse(null);
    }

    public void createOrUpdateMarksBulk(List<Mark> marks, String facultyUsername) {
        for (Mark mark : marks) {
            try {
                createOrUpdateMark(mark, facultyUsername);
            } catch (Exception e) {
                throw new RuntimeException(
                        "Error processing mark for student " + mark.getStudentId() + ": " + e.getMessage());
            }
        }
    }

    public List<Mark> getMarksBySubject(String subject) {
        return markRepository.findBySubject(subject);
    }

    private String calculateGrade(double total) {
        if (total >= 90)
            return "O";
        if (total >= 80)
            return "A";
        if (total >= 70)
            return "B";
        if (total >= 60)
            return "C";
        if (total >= 50)
            return "D";
        return "F";
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
