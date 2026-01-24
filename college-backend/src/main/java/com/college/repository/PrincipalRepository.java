package com.college.repository;

import com.college.model.Principal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrincipalRepository extends MongoRepository<Principal, String> {
    // Since there's only one principal, we might not need complex queries
}
