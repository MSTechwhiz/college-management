package com.college.service;

import com.college.model.User;
import com.college.model.Student;
import com.college.repository.UserRepository;
import com.college.repository.StudentRepository;
import com.college.repository.FeeRepository;
import com.college.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ChatbotService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Map<String, String> processQuery(String query) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        Map<String, String> response = new HashMap<>();
        if (userOpt.isEmpty()) {
            response.put("response", "I cannot identify you. Please log in.");
            return response;
        }

        User user = userOpt.get();
        String role = user.getRole();
        String normalizedQuery = query.toLowerCase();

        String answer = "I'm sorry, I didn't understand that. Try asking about 'attendance', 'fees', or 'schedule'.";

        if ("STUDENT".equals(role)) {
            answer = handleStudentQuery(user, normalizedQuery);
        } else if ("FACULTY".equals(role)) {
            answer = handleFacultyQuery(user, normalizedQuery);
        } else if ("ADMIN".equals(role)) {
            answer = "I am ready to assist with administrative tasks. Please refer to the dashboard for bulk operations.";
        }

        response.put("response", answer);
        return response;
    }

    private String handleStudentQuery(User user, String query) {
        Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
        if (studentOpt.isEmpty())
            return "Student record not found.";

        Student student = studentOpt.get();

        if (query.contains("attendance")) {
            long total = attendanceRepository.findByStudentId(student.getId()).size();
            // Basic logic - real logic would calculate percentage
            return "You have " + total
                    + " attendance records logged. Please check your dashboard for detailed percentages.";
        } else if (query.contains("fee") || query.contains("due")) {
            long pending = feeRepository.findByStudentIdAndStatus(student.getId(), "PENDING").size();
            if (pending > 0) {
                return "You have " + pending + " pending fee payments. Please verify in the Fees module.";
            } else {
                return "You have no pending fees record at the moment.";
            }
        } else if (query.contains("exam")) {
            return "The exam schedule for " + student.getDepartment() + " will be announced shortly.";
        }

        return "I can help you with 'attendance', 'fees', or 'exam schedule'.";
    }

    private String handleFacultyQuery(User user, String query) {
        if (query.contains("schedule") || query.contains("class")) {
            return "Your class schedule is available in the Timetable module.";
        } else if (query.contains("attendance")) {
            return "You can mark attendance for your assigned subjects in the Faculty Dashboard.";
        }
        return "I can assist with 'schedule' or 'attendance' queries.";
    }
}
