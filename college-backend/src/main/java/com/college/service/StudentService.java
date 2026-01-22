package com.college.service;

import com.college.model.*;
import com.college.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student getStudentByRegisterNumber(String registerNumber) {
        return studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student createStudent(Student student) {
        String registerNumber = Objects.requireNonNull(student.getRegisterNumber(), "Register number cannot be null");
        if (registerNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Register number cannot be empty");
        }
        
        if (studentRepository.existsByRegisterNumber(registerNumber)) {
            throw new RuntimeException("Register number already exists");
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(String id, Student student) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        String existingRegisterNumber = Objects.requireNonNull(existing.getRegisterNumber(), "Existing register number cannot be null");
        String newRegisterNumber = Objects.requireNonNull(student.getRegisterNumber(), "Register number cannot be null");
        
        if (newRegisterNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Register number cannot be empty");
        }
        
        if (!existingRegisterNumber.equals(newRegisterNumber) &&
            studentRepository.existsByRegisterNumber(newRegisterNumber)) {
            throw new RuntimeException("Register number already exists");
        }

        existing.setFullName(student.getFullName());
        existing.setDepartment(student.getDepartment());
        existing.setYear(student.getYear());
        existing.setSemester(student.getSemester());
        existing.setAdmissionType(student.getAdmissionType());
        existing.setQuota(student.getQuota());
        existing.setScholarshipCategory(student.getScholarshipCategory());

        return studentRepository.save(existing);
    }

    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }

    public void bulkUploadStudents(MultipartFile file) throws Exception {
        InputStream inputStream = file.getInputStream();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

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
        if (cell == null) return "";
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
        if (attendance.isEmpty()) return 0.0;
        long presentCount = attendance.stream().filter(Attendance::isPresent).count();
        return (presentCount * 100.0) / attendance.size();
    }
}
