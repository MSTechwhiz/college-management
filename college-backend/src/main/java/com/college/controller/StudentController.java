package com.college.controller;

import com.college.model.Student;
import com.college.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL', 'STUDENT')")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/register/{registerNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL')")
    public ResponseEntity<Student> getStudentByRegisterNumber(@PathVariable String registerNumber) {
        return ResponseEntity.ok(studentService.getStudentByRegisterNumber(registerNumber));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        // Logic should ensure User creation too ideally, or assume user creates it
        // separately.
        // For now, adhere to service.
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{registerNumber}/detail")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'PRINCIPAL', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentDetail(@PathVariable String registerNumber) {
        return ResponseEntity.ok(studentService.getStudentDetail(registerNumber));
    }
}
