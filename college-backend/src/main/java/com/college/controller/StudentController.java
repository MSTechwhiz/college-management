package com.college.controller;

import com.college.annotation.AuditAction;
import com.college.model.Student;
import com.college.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/register/{registerNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentDetail(@PathVariable String registerNumber) {
        return ResponseEntity.ok(studentService.getStudentDetail(registerNumber));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "CREATE_STUDENT", resource = "Student")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.createStudent(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @AuditAction(action = "UPDATE_STUDENT", resource = "Student", targetIdExpression = "#id")
    public ResponseEntity<?> updateStudent(@PathVariable String id, @RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.updateStudent(id, student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @AuditAction(action = "DELETE_STUDENT", resource = "Student", targetIdExpression = "#id")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk-upload")
    @AuditAction(action = "BULK_UPLOAD_STUDENTS", resource = "Student")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkUpload(@RequestParam("file") MultipartFile file) {
        try {
            studentService.bulkUploadStudents(file);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
