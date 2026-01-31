package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "gpa_records")
@CompoundIndex(def = "{'studentId': 1, 'semester': 1}", unique = true)
public class GPA {
    @Id
    private String id;

    private String studentId;
    private int semester;
    private double semesterGPA; // SGPA
    private double cumulativeCGPA; // CGPA up to this semester
    private int totalCredits;
    private int earnedCredits;

    private String status; // DRAFT or FINAL

    // Audit fields
    private java.time.LocalDateTime calculatedAt;

    public GPA() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public double getSemesterGPA() {
        return semesterGPA;
    }

    public void setSemesterGPA(double semesterGPA) {
        this.semesterGPA = semesterGPA;
    }

    public double getCumulativeCGPA() {
        return cumulativeCGPA;
    }

    public void setCumulativeCGPA(double cumulativeCGPA) {
        this.cumulativeCGPA = cumulativeCGPA;
    }

    public int getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(int totalCredits) {
        this.totalCredits = totalCredits;
    }

    public int getEarnedCredits() {
        return earnedCredits;
    }

    public void setEarnedCredits(int earnedCredits) {
        this.earnedCredits = earnedCredits;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.time.LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(java.time.LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
