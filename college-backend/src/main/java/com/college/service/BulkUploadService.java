package com.college.service;

import com.college.model.Student;
import com.college.repository.StudentRepository;
import com.college.repository.UserRepository;
import com.college.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class BulkUploadService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public List<String> uploadStudents(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        List<Student> studentsToSave = new ArrayList<>();
        List<User> usersToSave = new ArrayList<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                rowNumber++;

                // Skip header
                if (rowNumber == 1)
                    continue;

                // Stop at empty row
                if (isRowEmpty(currentRow))
                    break;

                try {
                    // Expected Columns: RegNo, Name, DOB (DD/MM/YYYY), Department, Batch, Year,
                    // Email
                    String regNo = getCellValue(currentRow, 0);
                    String name = getCellValue(currentRow, 1);
                    String dob = getCellValue(currentRow, 2);
                    String dept = getCellValue(currentRow, 3);
                    String batch = getCellValue(currentRow, 4);
                    String yearStr = getCellValue(currentRow, 5); // e.g. "1" or "2024"
                    String email = getCellValue(currentRow, 6);

                    // Validation
                    if (regNo.isEmpty() || name.isEmpty() || dob.isEmpty() || dept.isEmpty()) {
                        errors.add("Row " + rowNumber + ": Missing mandatory fields");
                        continue;
                    }

                    if (studentRepository.existsByRegisterNumber(regNo)) {
                        errors.add("Row " + rowNumber + ": Duplicate Register Number " + regNo);
                        continue;
                    }

                    if (userRepository.existsByUsername(regNo)) {
                        errors.add("Row " + rowNumber + ": User already exists " + regNo);
                        continue;
                    }

                    // Create User Account
                    User user = new User();
                    user.setUsername(regNo);
                    user.setPassword(passwordEncoder.encode(dob)); // Password is DOB
                    user.setRole("STUDENT");
                    user.setDepartment(dept);
                    // user.setEmail(email); // User model does not have email field yet
                    user.setLocked(false);

                    usersToSave.add(user);

                    // Create Student Record (linked later by ID/RegNo)
                    Student student = new Student();
                    student.setRegisterNumber(regNo);
                    student.setFullName(name);
                    student.setDateOfBirth(dob);
                    student.setDepartment(dept);
                    student.setBatch(batch);
                    student.setAcademicYear(yearStr); // Using string for now
                    student.setUserId(null); // Will set after user save if needed, or link via RegNo
                    // Actually Student links via userId usually.
                    // But we can't get ID until we save User.
                    // MongoDB generates ID on save.
                    // We need to save Users first, then link?
                    // Or save individually? But we need All-or-Nothing.
                    // Spring Data MongoDB 'saveAll' works.
                    // We'll map them.

                    studentsToSave.add(student);

                } catch (Exception e) {
                    errors.add("Row " + rowNumber + ": Error processing data - " + e.getMessage());
                }
            }
        }

        if (!errors.isEmpty()) {
            return errors; // Return errors, DO NOT SAVE
        }

        // Processing Valid Data
        // We need to save User to get ID, then set to Student.
        // But doing this in loop is okay if inside Transaction.

        for (int i = 0; i < usersToSave.size(); i++) {
            User savedUser = userRepository.save(usersToSave.get(i));
            Student student = studentsToSave.get(i);
            student.setUserId(savedUser.getId());
            studentRepository.save(student);
        }

        return new ArrayList<>(); // Empty list = success
    }

    private boolean isRowEmpty(Row row) {
        if (row == null)
            return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK)
                return false;
        }
        return true;
    }

    private String getCellValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return "";

        // Handle different cell types
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    java.time.LocalDate date = cell.getLocalDateTimeCellValue().toLocalDate();
                    // Format as DD/MM/YYYY
                    return String.format("%02d/%02d/%d", date.getDayOfMonth(), date.getMonthValue(), date.getYear());
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}
