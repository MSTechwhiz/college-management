package com.college.controller;

import com.college.model.Announcement;
import com.college.security.JwtUtil;
import com.college.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:3000")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/public")
    public ResponseEntity<List<Announcement>> getPublicAnnouncements() {
        return ResponseEntity.ok(announcementService.getPublicAnnouncements());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement, Authentication authentication) {
        return ResponseEntity.ok(announcementService.createAnnouncement(announcement, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Announcement>> getStudentAnnouncements(@RequestHeader("Authorization") String token) {
        String department = jwtUtil.extractDepartment(token.substring(7));
        return ResponseEntity.ok(announcementService.getAnnouncementsForStudent(department));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<Announcement>> getFacultyAnnouncements(@RequestHeader("Authorization") String token) {
        String department = jwtUtil.extractDepartment(token.substring(7));
        return ResponseEntity.ok(announcementService.getAnnouncementsForFaculty(department));
    }
}
