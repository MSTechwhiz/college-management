package com.college.controller;

import com.college.annotation.AuditAction;
import com.college.model.Announcement;
import com.college.security.JwtUtil;
import com.college.service.AnnouncementService;
import com.college.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:3000")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/public")
    public ResponseEntity<List<Announcement>> getPublicAnnouncements() {
        return ResponseEntity.ok(announcementService.getPublicAnnouncements());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @AuditAction(action = "CREATE_ANNOUNCEMENT", resource = "Announcement")
    public ResponseEntity<Announcement> createAnnouncement(@Valid @RequestBody Announcement announcement,
            Authentication authentication) {
        Announcement created = announcementService.createAnnouncement(announcement, authentication.getName());
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "CREATE_ANNOUNCEMENT", created.getId(), null);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'FACULTY')")
    public ResponseEntity<List<Announcement>> getAllAnnouncements(Authentication authentication,
            @RequestHeader(value = "Authorization", required = false) String token) {
        // Derive role & department strictly from JWT claims to enforce backend-driven
        // access rules.
        // Admin: sees all announcements; Others: filtered by target + department +
        // publishDate <= now.
        if (token == null || token.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is required");
        }
        String jwt = token.substring(7);
        String role = jwtUtil.extractRole(jwt);
        if (role == null || role.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Role not found in token");
        }

        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(announcementService.getAllAnnouncements());
        }

        String department = jwtUtil.extractDepartment(jwt);
        if (department == null || department.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department information not found in token");
        }

        if ("STUDENT".equals(role)) {
            return ResponseEntity.ok(announcementService.getAnnouncementsForStudent(department));
        } else if ("FACULTY".equals(role)) {
            return ResponseEntity.ok(announcementService.getAnnouncementsForFaculty(department));
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid role");
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

    @PutMapping("/{id}")
    @AuditAction(action = "UPDATE_ANNOUNCEMENT", resource = "Announcement", targetIdExpression = "#id")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable String id,
            @Valid @RequestBody Announcement announcement, Authentication authentication) {
        Announcement updated = announcementService.updateAnnouncement(id, announcement);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "UPDATE_ANNOUNCEMENT", id, null);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @AuditAction(action = "DELETE_ANNOUNCEMENT", resource = "Announcement", targetIdExpression = "#id")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable String id, Authentication authentication) {
        announcementService.deleteAnnouncement(id);
        String authRole = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("UNKNOWN");
        auditLogService.log(authentication.getName(), authRole, "DELETE_ANNOUNCEMENT", id, null);
        return ResponseEntity.ok().build();
    }
}
