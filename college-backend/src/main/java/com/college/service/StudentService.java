package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarkRepository markRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student not found"));
    }

    public Student getStudentByRegisterNumber(String registerNumber) {
        return studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Student with register number " + registerNumber + " not found"));
    }

    @Transactional
    public Student createStudent(Student student) {
        // Defensive null check
        if (student == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Student data is required");
        }

        // Validate required fields
        if (student.getRegisterNumber() == null || student.getRegisterNumber().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Register number is required");
        }

        if (student.getFullName() == null || student.getFullName().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Full name is required");
        }

        if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Department is required");
        }

        // Validate cross-field constraints
        if (student.getYear() < 1 || student.getYear() > 4) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Year must be between 1 and 4");
        }

        if (student.getSemester() < 1 || student.getSemester() > 8) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Semester must be between 1 and 8");
        }

        if (student.getSemester() > student.getYear() * 2) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Semester cannot exceed year * 2");
        }

        // Check uniqueness
        if (studentRepository.existsByRegisterNumber(student.getRegisterNumber())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, "Register number already exists");
        }

        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(String id, Student student) {
        // Defensive null checks
        if (id == null || id.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Student ID is required");
        }
        if (student == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Student data is required");
        }

        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student not found"));

        // Validate updated fields
        if (student.getRegisterNumber() != null && !student.getRegisterNumber().trim().isEmpty()) {
            if (!existing.getRegisterNumber().equals(student.getRegisterNumber()) &&
                    studentRepository.existsByRegisterNumber(student.getRegisterNumber())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT, "Register number already exists");
            }
            existing.setRegisterNumber(student.getRegisterNumber());
        }

        if (student.getFullName() != null && !student.getFullName().trim().isEmpty()) {
            existing.setFullName(student.getFullName());
        }

        if (student.getDepartment() != null && !student.getDepartment().trim().isEmpty()) {
            existing.setDepartment(student.getDepartment());
        }

        if (student.getYear() > 0) {
            if (student.getYear() < 1 || student.getYear() > 4) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Year must be between 1 and 4");
            }
            existing.setYear(student.getYear());
        }

        if (student.getSemester() > 0) {
            if (student.getSemester() < 1 || student.getSemester() > 8) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Semester must be between 1 and 8");
            }
            if (student.getSemester() > existing.getYear() * 2) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Semester cannot exceed year * 2");
            }
            existing.setSemester(student.getSemester());
        }

        return studentRepository.save(existing);
    }

    @Transactional
    public void deleteStudent(String id) {
        // Defensive check - ensure resource exists before deletion
        if (id == null || id.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Student ID is required");
        }

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student not found"));

        // Check for dependencies and BLOCK deletion if they exist (Safe Delete)
        List<Attendance> attendances = attendanceRepository.findByStudentId(id);
        if (!attendances.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, 
                    "Cannot delete student: Attendance records exist. Please delete them first or archive the student.");
        }

        List<Mark> marks = markRepository.findByStudentId(id);
        if (!marks.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, 
                    "Cannot delete student: Mark records exist. Please delete them first or archive the student.");
        }

        List<Fee> fees = feeRepository.findByStudentId(id);
        if (!fees.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, 
                    "Cannot delete student: Fee records exist. Please delete them first or archive the student.");
        }

        // Finally delete the student
        studentRepository.deleteById(id);
    }

    public void bulkUploadStudents(MultipartFile file) throws Exception {
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            Student student = new Student();
            String registerNumber = getCellValue(row.getCell(0));
            String fullName = getCellValue(row.getCell(1));
            String department = getCellValue(row.getCell(2));

            if (registerNumber == null || registerNumber.trim().isEmpty()) {
                continue; // Skip rows with empty register number
            }

            student.setRegisterNumber(registerNumber);
            student.setFullName(fullName);
            student.setDepartment(department);
            student.setYear((int) row.getCell(3).getNumericCellValue());
            student.setSemester((int) row.getCell(4).getNumericCellValue());
            student.setAdmissionType(getCellValue(row.getCell(5)));
            student.setQuota(getCellValue(row.getCell(6)));
            student.setScholarshipCategory(getCellValue(row.getCell(7)));

            if (!studentRepository.existsByRegisterNumber(student.getRegisterNumber())) {
                studentRepository.save(student);
            }
        }
        workbook.close();
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return "";
    }

    public Map<String, Object> getStudentDetail(String registerNumber) {
        if (registerNumber == null || registerNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Register number cannot be null or empty");
        }

        Student student = studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String studentId = student.getId();
        if (studentId == null) {
            throw new IllegalStateException("Student ID is null");
        }

        List<Fee> fees = feeRepository.findByStudentId(studentId);
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);
        List<Mark> marks = markRepository.findByStudentId(studentId);

        double attendancePercentage = calculateAttendancePercentage(attendance);

        Map<String, Object> detail = new HashMap<>();
        detail.put("student", student);
        detail.put("fees", fees);
        detail.put("attendance", attendance);
        detail.put("attendancePercentage", attendancePercentage);
        detail.put("marks", marks);

        return detail;
    }

    private double calculateAttendancePercentage(List<Attendance> attendance) {
        if (attendance.isEmpty())
            return 0.0;
        long presentCount = attendance.stream().filter(Attendance::isPresent).count();
        return (presentCount * 100.0) / attendance.size();
    }
}
