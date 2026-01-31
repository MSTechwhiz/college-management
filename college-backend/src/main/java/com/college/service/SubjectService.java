package com.college.service;

import com.college.model.Subject;
import com.college.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Transactional
    public Subject createSubject(Subject subject) {
        if (subject.getSubjectCode() != null) {
            if (subjectRepository.findBySubjectCode(subject.getSubjectCode()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Subject with code " + subject.getSubjectCode() + " already exists");
            }
        }
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));
    }

    public Subject getSubjectByCode(String code) {
        return subjectRepository.findBySubjectCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Subject with code " + code + " not found"));
    }

    public List<Subject> getSubjectsByDepartmentAndSemester(String department, int semester) {
        return subjectRepository.findByDepartmentAndSemester(department, semester);
    }

    @Transactional
    public Subject updateSubject(String id, Subject subjectUpdates) {
        Subject existing = getSubjectById(id);

        if (subjectUpdates.getSubjectName() != null) {
            existing.setSubjectName(subjectUpdates.getSubjectName());
        }
        if (subjectUpdates.getCredits() > 0) {
            existing.setCredits(subjectUpdates.getCredits());
        }
        if (subjectUpdates.getSemester() > 0) {
            existing.setSemester(subjectUpdates.getSemester());
        }
        if (subjectUpdates.getDepartment() != null) {
            existing.setDepartment(subjectUpdates.getDepartment());
        }
        if (subjectUpdates.getType() != null) {
            existing.setType(subjectUpdates.getType());
        }

        return subjectRepository.save(existing);
    }

    @Transactional
    public void deleteSubject(String id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found");
        }
        subjectRepository.deleteById(id);
    }
}
