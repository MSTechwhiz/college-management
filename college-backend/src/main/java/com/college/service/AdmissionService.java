package com.college.service;

import com.college.model.Admission;
import com.college.repository.AdmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdmissionService {

    @Autowired
    private AdmissionRepository admissionRepository;

    public Admission createAdmission(Admission admission) {
        admission.setAdmissionDate(LocalDateTime.now());
        return admissionRepository.save(admission);
    }

    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAll();
    }

    public List<Admission> getAdmissionsByDepartment(String department) {
        return admissionRepository.findByDepartment(department);
    }

    public Map<String, Long> getDepartmentStatistics() {
        List<Admission> allAdmissions = admissionRepository.findAll();
        return allAdmissions.stream()
                .collect(Collectors.groupingBy(Admission::getDepartment, Collectors.counting()));
    }
}
