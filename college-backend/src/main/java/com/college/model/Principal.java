package com.college.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "principal")
public class Principal {
    @Id
    private String id;
    
    private String name;
    private String qualification;
    private String experience;
    private String message; // Message to students/staff
    private String photoUrl;
    private String email;
    private String phone;

    public Principal() {}

    public Principal(String name, String qualification, String message) {
        this.name = name;
        this.qualification = qualification;
        this.message = message;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
