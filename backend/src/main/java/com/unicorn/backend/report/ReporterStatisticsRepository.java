package com.unicorn.backend.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ReporterStatistics entity.
 */
@Repository
public interface ReporterStatisticsRepository extends JpaRepository<ReporterStatistics, UUID> {

    /**
     * Find statistics by user ID.
     */
    Optional<ReporterStatistics> findByUserId(UUID userId);

    /**
     * Check if user is restricted from reporting.
     */
    boolean existsByUserIdAndReportingRestrictedTrue(UUID userId);
}
