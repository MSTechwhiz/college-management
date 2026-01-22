package com.college.service;

import com.college.model.Mark;
import com.college.repository.MarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    public Mark createOrUpdateMark(Mark mark, String facultyId) {
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
        markToSave.setFacultyId(facultyId);
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

    private String calculateGrade(double total) {
        if (total >= 90) return "S";
        if (total >= 80) return "A";
        if (total >= 70) return "B";
        if (total >= 60) return "C";
        if (total >= 50) return "D";
        return "F";
    }
}
