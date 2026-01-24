package com.college.service;

import com.college.model.Principal;
import com.college.repository.PrincipalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrincipalService {

    @Autowired
    private PrincipalRepository principalRepository;

    public Principal getPrincipalProfile() {
        List<Principal> principals = principalRepository.findAll();
        if (principals.isEmpty()) {
            return null; // Or return a default/empty object
        }
        return principals.get(0); // Assuming only one principal record exists
    }

    public Principal updatePrincipalProfile(Principal principal) {
        Principal existing = getPrincipalProfile();
        if (existing != null) {
            principal.setId(existing.getId());
        }
        return principalRepository.save(principal);
    }
}
