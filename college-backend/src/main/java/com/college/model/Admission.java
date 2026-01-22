package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "admissions")
public class Admission {
    @Id
    private String id;
    
    private String registerNumber;
    private String department;
    private String admissionMethod; // Counselling, Management
    private String quota;
    private String scholarshipCategory; // FG, BC, MBC, Others
    private LocalDateTime admissionDate;

    public Admission() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAdmissionMethod() { return admissionMethod; }
    public void setAdmissionMethod(String admissionMethod) { this.admissionMethod = admissionMethod; }

    public String getQuota() { return quota; }
    public void setQuota(String quota) { this.quota = quota; }

    public String getScholarshipCategory() { return scholarshipCategory; }
    public void setScholarshipCategory(String scholarshipCategory) { this.scholarshipCategory = scholarshipCategory; }

    public LocalDateTime getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDateTime admissionDate) { this.admissionDate = admissionDate; }
}
