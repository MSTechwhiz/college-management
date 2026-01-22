package com.college.service;

import com.college.model.Attendance;
import com.college.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Attendance markAttendance(Attendance attendance, String facultyId) {
        if (attendanceRepository.existsBySubjectAndDateAndStudentId(
                attendance.getSubject(), attendance.getDate(), attendance.getStudentId())) {
            throw new RuntimeException("Attendance already marked for this date and subject");
        }

        attendance.setFacultyId(facultyId);
        attendance.setLocked(false);
        return attendanceRepository.save(attendance);
    }

    public void markBulkAttendance(String subject, String date, List<Map<String, Object>> attendanceList, String facultyId) {
        for (Map<String, Object> att : attendanceList) {
            Attendance attendance = new Attendance();
            attendance.setStudentId(att.get("studentId").toString());
            attendance.setRegisterNumber(att.get("registerNumber").toString());
            attendance.setSubject(subject);
            attendance.setDate(date);
            attendance.setPresent(Boolean.parseBoolean(att.get("present").toString()));
            attendance.setFacultyId(facultyId);
            attendance.setLocked(true); // Lock after bulk submission

            if (!attendanceRepository.existsBySubjectAndDateAndStudentId(subject, date, attendance.getStudentId())) {
                attendanceRepository.save(attendance);
            }
        }
    }

    public List<Attendance> getAttendanceByStudent(String studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceBySubjectAndDate(String subject, String date) {
        return attendanceRepository.findBySubjectAndDate(subject, date);
    }

    public double getAttendancePercentage(String studentId, String subject) {
        List<Attendance> attendance = attendanceRepository.findByStudentIdAndSubject(studentId, subject);
        if (attendance.isEmpty()) return 0.0;
        long presentCount = attendance.stream().filter(Attendance::isPresent).count();
        return (presentCount * 100.0) / attendance.size();
    }
}
