package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendance")
public class Attendance {
    @Id
    private String id;
    
    private String studentId;
    private String registerNumber;
    private String subject;
    private String date;
    private boolean present;
    private String facultyId;
    private boolean locked; // Cannot edit after submission

    public Attendance() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
}
