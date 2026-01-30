package com.college.service;

import com.college.model.Attendance;
import com.college.model.Faculty;
import com.college.model.Student;
import com.college.model.User;
import com.college.repository.AttendanceRepository;
import com.college.repository.FacultyRepository;
import com.college.repository.StudentRepository;
import com.college.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public Attendance markAttendance(Attendance attendance, String facultyUsername) {
        if (attendance.getStudentId() == null || attendance.getStudentId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
        }
        if (attendance.getSubject() == null || attendance.getSubject().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }
        if (attendance.getDate() == null || attendance.getDate().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        // Derive semester from student to avoid UI changes

        User user = userRepository.findByUsername(facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found for user"));
        Student student = studentRepository.findById(attendance.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (!faculty.getDepartment().equals(student.getDepartment())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to mark attendance for this student");
        }
        if (faculty.getSubjects() != null && !faculty.getSubjects().isEmpty()) {
            if (!faculty.getSubjects().contains(attendance.getSubject())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You are not authorized to mark attendance for this subject");
            }
        }

        attendance.setSemester(student.getSemester());
        if (attendanceRepository.existsBySubjectAndDateAndStudentIdAndSemester(
                attendance.getSubject(), attendance.getDate(), attendance.getStudentId(), attendance.getSemester())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Attendance already marked for this date, subject, and semester");
        }

        attendance.setFacultyId(faculty.getFacultyId());
        attendance.setRegisterNumber(student.getRegisterNumber());
        attendance.setLocked(false);
        Attendance saved = attendanceRepository.save(attendance);
        // Read-after-write: verify immediate visibility
        boolean visible = attendanceRepository.existsBySubjectAndDateAndStudentIdAndSemester(
                saved.getSubject(), saved.getDate(), saved.getStudentId(), saved.getSemester());
        if (!visible) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Attendance not visible after save");
        }
        return saved;
    }

    @Transactional
    public void markBulkAttendance(String subject, String date, List<Map<String, Object>> attendanceList,
            String facultyUsername) {
        if (subject == null || subject.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }
        if (date == null || date.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }

        User user = userRepository.findByUsername(facultyUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found for user"));

        for (Map<String, Object> att : attendanceList) {
            try {
                Attendance attendance = new Attendance();
                attendance.setStudentId(att.get("studentId").toString());
                attendance.setSubject(subject);
                attendance.setDate(date);
                attendance.setPresent(Boolean.parseBoolean(att.get("present").toString()));

                attendance.setFacultyId(faculty.getFacultyId());
                attendance.setLocked(true);

                Student student = studentRepository.findById(attendance.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student not found: " + attendance.getStudentId()));

                if (!faculty.getDepartment().equals(student.getDepartment())) {
                    continue;
                }
                if (faculty.getSubjects() != null && !faculty.getSubjects().isEmpty()) {
                    if (!faculty.getSubjects().contains(attendance.getSubject())) {
                        continue;
                    }
                }

                attendance.setRegisterNumber(student.getRegisterNumber());
                attendance.setSemester(student.getSemester());

                if (!attendanceRepository.existsBySubjectAndDateAndStudentIdAndSemester(subject, date,
                        attendance.getStudentId(), attendance.getSemester())) {
                    Attendance saved = attendanceRepository.save(attendance);
                    // Read-after-write per record
                    boolean visible = attendanceRepository.existsBySubjectAndDateAndStudentIdAndSemester(
                            subject, date, attendance.getStudentId(), attendance.getSemester());
                    if (!visible) {
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "Attendance not visible after save for student " + attendance.getStudentId());
                    }
                }
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Error processing attendance record: " + e.getMessage());
            }
        }
    }

    public List<Attendance> getAttendanceByStudent(String identifier) {
        String studentId = resolveStudentId(identifier);
        if (studentId == null || studentId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        // Query by studentId (primary identifier)
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        // Return empty list instead of throwing exception - read-after-write
        // consistency
        return records;
    }

    public List<Attendance> getAttendanceBySubjectAndDate(String subject, String date) {
        return attendanceRepository.findBySubjectAndDate(subject, date);
    }

    public double getAttendancePercentage(String identifier, String subject) {
        String studentId = resolveStudentId(identifier);
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) return 0.0;
        List<Attendance> attendance = attendanceRepository.findByStudentIdAndSubjectAndSemester(
                studentId, subject, student.getSemester());
        if (attendance.isEmpty())
            return 0.0;
        long presentCount = attendance.stream().filter(Attendance::isPresent).count();
        return (presentCount * 100.0) / attendance.size();
    }

    private String resolveStudentId(String identifier) {
        // 1. Try if it is a valid Student ID
        if (studentRepository.existsById(identifier)) {
            return identifier;
        }

        // 2. Try Register Number
        java.util.Optional<Student> byReg = studentRepository.findByRegisterNumber(identifier);
        if (byReg.isPresent()) {
            return byReg.get().getId();
        }

        // 3. Try User ID
        java.util.Optional<Student> byUser = studentRepository.findByUserId(identifier);
        if (byUser.isPresent()) {
            return byUser.get().getId();
        }

        // Return original if nothing matches (will likely result in empty list)
        return identifier;
    }
}
