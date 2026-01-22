package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "marks")
public class Mark {
    @Id
    private String id;
    
    private String studentId;
    private String registerNumber;
    private String subject;
    private double caMarks;
    private double modelMarks;
    private double practicalMarks;
    private double totalMarks;
    private String grade;
    private String facultyId;
    private boolean locked; // Cannot edit after submission

    public Mark() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public double getCaMarks() { return caMarks; }
    public void setCaMarks(double caMarks) { this.caMarks = caMarks; }

    public double getModelMarks() { return modelMarks; }
    public void setModelMarks(double modelMarks) { this.modelMarks = modelMarks; }

    public double getPracticalMarks() { return practicalMarks; }
    public void setPracticalMarks(double practicalMarks) { this.practicalMarks = practicalMarks; }

    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }
}
