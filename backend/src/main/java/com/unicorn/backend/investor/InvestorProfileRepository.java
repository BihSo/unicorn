package com.unicorn.backend.investor;

import com.unicorn.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for InvestorProfile entity.
 */
@Repository
public interface InvestorProfileRepository extends JpaRepository<InvestorProfile, UUID> {

    /**
     * Find an investor profile by user.
     *
     * @param user the user associated with the profile
     * @return Optional containing the profile if found
     */
    Optional<InvestorProfile> findByUser(User user);

    /**
     * Check if a profile exists for a specific user.
     *
     * @param user the user to check
     * @return true if profile exists, false otherwise
     */
    boolean existsByUser(User user);

    /**
     * Count investors with isVerified = false.
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i.id) FROM InvestorProfile i WHERE i.isVerified = false")
    long countPendingVerifications();

    /**
     * Find investors who requested verification but are not yet verified.
     */
    @org.springframework.data.jpa.repository.Query("SELECT i FROM InvestorProfile i WHERE i.verificationRequested = true AND i.isVerified = false ORDER BY i.verificationRequestedAt ASC")
    java.util.List<InvestorProfile> findPendingVerificationQueue();

    /**
     * Find all verified investors.
     */
    @org.springframework.data.jpa.repository.Query("SELECT i FROM InvestorProfile i WHERE i.isVerified = true")
    java.util.List<InvestorProfile> findVerifiedInvestors();

    /**
     * Count investors with isVerified = true.
     */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i.id) FROM InvestorProfile i WHERE i.isVerified = true")
    long countVerifiedInvestors();

    /**
     * Sum of investment budget across all profiles.
     */
    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.investmentBudget) FROM InvestorProfile i")
    java.math.BigDecimal sumInvestmentBudget();
}
