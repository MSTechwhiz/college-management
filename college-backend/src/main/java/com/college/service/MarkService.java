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
        markToSave.setGrade(calculateGrade(total));
        markToSave.setFacultyId(faculty.getFacultyId());
        markToSave.setLocked(true); // Lock after submission

        return markRepository.save(markToSave);
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
                // Log error or rethrow if strict
                // For now, rethrow to stop on error
                throw new RuntimeException("Error processing mark for student " + mark.getStudentId() + ": " + e.getMessage());
            }
        }
    }

    public List<Mark> getMarksBySubject(String subject) {
        return markRepository.findBySubject(subject);
    }

    private String calculateGrade(double total) {
        if (total >= 90) return "S";
        if (total >= 80) return "A";
        if (total >= 70) return "B";
        if (total >= 60) return "C";
        if (total >= 50) return "D";
        return "F";
    }
}
