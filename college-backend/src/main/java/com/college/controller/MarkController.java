package com.college.controller;

import com.college.model.Mark;
import com.college.security.JwtUtil;
import com.college.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "http://localhost:3000")
public class MarkController {

    @Autowired
    private MarkService markService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<?> createOrUpdateMark(@RequestBody Mark mark, @RequestHeader("Authorization") String token) {
        try {
            String facultyId = jwtUtil.extractUsername(token.substring(7));
            return ResponseEntity.ok(markService.createOrUpdateMark(mark, facultyId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<List<Mark>> getMarksByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(markService.getMarksByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/subject/{subject}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<Mark> getMarkByStudentAndSubject(@PathVariable String studentId, @PathVariable String subject) {
        Mark mark = markService.getMarkByStudentAndSubject(studentId, subject);
        if (mark == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mark);
    }
}
