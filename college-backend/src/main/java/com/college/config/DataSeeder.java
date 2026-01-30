package com.college.config;

import com.college.model.User;
import com.college.model.Department;
import com.college.model.Faculty;
import com.college.model.Student;
import com.college.repository.UserRepository;
import com.college.repository.DepartmentRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedDepartments();
        seedAdmin();
        seedPrincipal();
        seedFaculty();
        seedStudents();
    }

    private void seedDepartments() {
        String[] deptNames = { "IT", "CSE", "ECE", "AI & DS", "MBA", "MCA" };
        for (String name : deptNames) {
            if (!departmentRepository.existsByName(name)) {
                Department dept = new Department();
                dept.setName(name);
                departmentRepository.save(dept);
            }
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByUsername("admin@sbc")) {
            User admin = new User();
            admin.setUsername("admin@sbc");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("ADMIN");
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    private void seedPrincipal() {
        if (!userRepository.existsByUsername("principal@sbc")) {
            User principal = new User();
            principal.setUsername("principal@sbc");
            principal.setPassword(passwordEncoder.encode("principle@123"));
            principal.setRole("PRINCIPAL");
            principal.setActive(true);
            userRepository.save(principal);
        }
    }

    private void seedFaculty() {
        seedFacultyUser("faculty_it@sbc", "Faculty@123", "IT", "FAC001", "Dr. IT Faculty", null);
        seedFacultyUser("faculty_cse@sbc", "Faculty@123", "CSE", "FAC002", "Dr. CSE Faculty", null);
        seedFacultyUser("faculty_ece@sbc", "Faculty@123", "ECE", "FAC003", "Dr. ECE Faculty", null);
        if (!userRepository.existsByUsername("faculty")) {
            seedFacultyUser("faculty", "01/01/1999", "IT", "FACTEST", "Test Faculty", "01/01/1999");
        }
    }

    private void seedFacultyUser(String username, String password, String department, String facultyId, String name,
            String dob) {
        if (!userRepository.existsByUsername(username)) {
            // Create User
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole("FACULTY");
            user.setDepartments(Arrays.asList(department));
            user.setDepartment(department);
            user.setActive(true);
            user = userRepository.save(user);

            // Create Faculty
            Faculty faculty = new Faculty();
            faculty.setFacultyId(facultyId);
            faculty.setName(name);
            faculty.setDepartment(department);
            faculty.setRole("FACULTY");
            faculty.setSubjects(Arrays.asList("Subject 1", "Subject 2"));
            faculty.setYears(Arrays.asList("I", "II", "III", "IV"));
            faculty.setUserId(user.getId());
            if (dob != null) {
                faculty.setDateOfBirth(dob);
            }
            facultyRepository.save(faculty);
        }
    }

    private void seedStudents() {
        seedStudentUser("student_it_01@sbc", "Student@123", "IT", "IT001", "IT Student 01", null);
        seedStudentUser("student_cse_01@sbc", "Student@123", "CSE", "CSE001", "CSE Student 01", null);
        if (!userRepository.existsByUsername("512122205049")) {
            seedStudentUser("512122205049", "08/09/2004", "IT", "512122205049", "Test Student", "08/09/2004");
        }
    }

    private void seedStudentUser(String username, String password, String department, String registerNumber,
            String fullName, String dob) {
        if (!userRepository.existsByUsername(username)) {
            // Create User
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole("STUDENT");
            user.setDepartments(Arrays.asList(department));
            user.setDepartment(department);
            user.setActive(true);
            user = userRepository.save(user);

            // Create Student
            Student student = new Student();
            student.setRegisterNumber(registerNumber);
            student.setFullName(fullName);
            student.setDepartment(department);
            student.setYear(1);
            student.setSemester(1);
            student.setAdmissionType("Counselling");
            student.setQuota("General");
            student.setScholarshipCategory("Others");
            student.setUserId(user.getId());
            if (dob != null) {
                student.setDateOfBirth(dob);
            }
            studentRepository.save(student);
        }
    }
}
