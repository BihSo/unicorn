package com.unicorn.backend.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Report entity.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

        /**
         * Find reports by status with pagination.
         */
        Page<Report> findByStatus(ReportStatus status, Pageable pageable);

        /**
         * Find reports by entity type with pagination.
         */
        Page<Report> findByReportedEntityType(ReportedEntityType entityType, Pageable pageable);

        /**
         * Find reports by reporter ID.
         */
        Page<Report> findByReporterId(UUID reporterId, Pageable pageable);

        /**
         * Find reports for a specific entity.
         */
        List<Report> findByReportedEntityTypeAndReportedEntityId(
                        ReportedEntityType entityType,
                        UUID entityId);

        /**
         * Count reports by reporter and status.
         */
        long countByReporterIdAndStatus(UUID reporterId, ReportStatus status);

        /**
         * Count reports for a specific entity.
         */
        long countByReportedEntityTypeAndReportedEntityId(
                        ReportedEntityType entityType,
                        UUID entityId);

        /**
         * Count total reports by status.
         */
        long countByStatus(ReportStatus status);

        /**
         * Check if a duplicate report exists.
         */
        boolean existsByReporterIdAndReportedEntityTypeAndReportedEntityIdAndStatusIn(
                        UUID reporterId,
                        ReportedEntityType entityType,
                        UUID entityId,
                        List<ReportStatus> statuses);
}
