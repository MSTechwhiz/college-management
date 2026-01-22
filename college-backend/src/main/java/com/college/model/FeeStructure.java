package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fee_structures")
public class FeeStructure {
    @Id
    private String id;
    
    private String department;
    private int year;
    private int semester;
    private double amount;

    public FeeStructure() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}
