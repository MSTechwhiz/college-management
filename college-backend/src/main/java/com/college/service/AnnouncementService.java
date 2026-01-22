package com.college.service;

import com.college.model.Announcement;
import com.college.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public Announcement createAnnouncement(Announcement announcement, String createdBy) {
        if (announcement.getTitle() == null || announcement.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (announcement.getContent() == null || announcement.getContent().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required");
        }
        Set<String> allowedTargets = Set.of("ALL", "STUDENTS", "FACULTY", "DEPARTMENT");
        if (announcement.getTarget() == null || !allowedTargets.contains(announcement.getTarget())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target value");
        }
        if ("DEPARTMENT".equals(announcement.getTarget())) {
            if (announcement.getDepartment() == null || announcement.getDepartment().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department is required when target is DEPARTMENT");
            }
        } else {
            announcement.setDepartment(null);
        }
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setCreatedBy(createdBy);
        if (announcement.getPublishDate() == null) {
            announcement.setPublishDate(LocalDateTime.now());
        }
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public List<Announcement> getPublicAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        return announcementRepository.findByPublishDateLessThanEqualOrderByPublishDateDesc(now);
    }

    public List<Announcement> getAnnouncementsForStudent(String department) {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> all = announcementRepository.findByTargetAndPublishDateLessThanEqualOrderByPublishDateDesc("ALL", now);
        List<Announcement> students = announcementRepository.findByTargetAndPublishDateLessThanEqualOrderByPublishDateDesc("STUDENTS", now);
        List<Announcement> dept = announcementRepository.findByTargetAndDepartmentAndPublishDateLessThanEqualOrderByPublishDateDesc("DEPARTMENT", department, now);
        
        return java.util.stream.Stream.concat(
            java.util.stream.Stream.concat(all.stream(), students.stream()),
            dept.stream()
        ).distinct().collect(java.util.stream.Collectors.toList());
    }

    public List<Announcement> getAnnouncementsForFaculty(String department) {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> all = announcementRepository.findByTargetAndPublishDateLessThanEqualOrderByPublishDateDesc("ALL", now);
        List<Announcement> faculty = announcementRepository.findByTargetAndPublishDateLessThanEqualOrderByPublishDateDesc("FACULTY", now);
        List<Announcement> dept = announcementRepository.findByTargetAndDepartmentAndPublishDateLessThanEqualOrderByPublishDateDesc("DEPARTMENT", department, now);
        
        return java.util.stream.Stream.concat(
            java.util.stream.Stream.concat(all.stream(), faculty.stream()),
            dept.stream()
        ).distinct().collect(java.util.stream.Collectors.toList());
    }
}
