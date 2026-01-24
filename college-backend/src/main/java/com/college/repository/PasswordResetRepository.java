package com.college.repository;

import com.college.model.PasswordReset;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends MongoRepository<PasswordReset, String> {
    Optional<PasswordReset> findByResetToken(String resetToken);

    Optional<PasswordReset> findByUsernameAndUsedFalse(String username);

    void deleteByUsernameAndUsedTrue(String username);
}
