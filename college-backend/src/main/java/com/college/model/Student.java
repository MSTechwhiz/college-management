package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "students")
public class Student {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String registerNumber;
    
    private String fullName;
    private String department;
    private int year;
    private int semester;
    private String admissionType; // Counselling, Management
    private String quota;
    private String scholarshipCategory; // FG, BC, MBC, Others
    private String userId; // Reference to User

    public Student() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getAdmissionType() { return admissionType; }
    public void setAdmissionType(String admissionType) { this.admissionType = admissionType; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public String getScholarshipCategory() { return scholarshipCategory; }
    public void setScholarshipCategory(String scholarshipCategory) { this.scholarshipCategory = scholarshipCategory; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
