package com.college.controller;

import com.college.model.Principal;
import com.college.service.PrincipalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/principal")
@CrossOrigin(origins = "http://localhost:3000")
public class PrincipalController {

    @Autowired
    private PrincipalService principalService;

    @GetMapping
    public ResponseEntity<Principal> getPrincipal() {
        Principal principal = principalService.getPrincipalProfile();
        if (principal == null) {
            // Return default if not set
            Principal defaultPrincipal = new Principal();
            defaultPrincipal.setName("Dr. Rajavel");
            defaultPrincipal.setQualification("M.E., Ph.D.");
            return ResponseEntity.ok(defaultPrincipal);
        }
        return ResponseEntity.ok(principal);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Principal> updatePrincipal(@RequestBody Principal principal) {
        return ResponseEntity.ok(principalService.updatePrincipalProfile(principal));
    }
}
