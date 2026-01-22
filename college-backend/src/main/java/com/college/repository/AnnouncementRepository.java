package com.college.repository;

import com.college.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findByPublishDateLessThanEqualOrderByPublishDateDesc(LocalDateTime date);
    List<Announcement> findByTargetAndPublishDateLessThanEqualOrderByPublishDateDesc(String target, LocalDateTime date);
    List<Announcement> findByTargetAndDepartmentAndPublishDateLessThanEqualOrderByPublishDateDesc(String target, String department, LocalDateTime date);
}
