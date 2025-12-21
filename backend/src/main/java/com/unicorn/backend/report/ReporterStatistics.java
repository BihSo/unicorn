package com.unicorn.backend.report;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity tracking reporter behavior and statistics.
 * Used to identify and manage false reporters.
 */
@Entity
@Table(name = "reporter_statistics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporterStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "total_reports_submitted")
    @Builder.Default
    private Integer totalReportsSubmitted = 0;

    @Column(name = "resolved_reports")
    @Builder.Default
    private Integer resolvedReports = 0;

    @Column(name = "rejected_reports")
    @Builder.Default
    private Integer rejectedReports = 0;

    @Column(name = "false_report_rate")
    @Builder.Default
    private Float falseReportRate = 0.0f;

    @Column(name = "reporting_restricted")
    @Builder.Default
    private Boolean reportingRestricted = false;

    @Column(name = "restricted_at")
    private LocalDateTime restrictedAt;

    @Column(name = "restriction_reason", columnDefinition = "TEXT")
    private String restrictionReason;

    @Column(name = "warning_count")
    @Builder.Default
    private Integer warningCount = 0;

    @Column(name = "last_warning_at")
    private LocalDateTime lastWarningAt;

    /**
     * Calculate and update the false report rate.
     */
    public void calculateFalseReportRate() {
        if (totalReportsSubmitted == 0) {
            this.falseReportRate = 0.0f;
        } else {
            this.falseReportRate = (float) rejectedReports / totalReportsSubmitted;
        }
    }

    /**
     * Increment total reports counter.
     */
    public void incrementTotalReports() {
        this.totalReportsSubmitted++;
        calculateFalseReportRate();
    }

    /**
     * Increment resolved reports counter.
     */
    public void incrementResolvedReports() {
        this.resolvedReports++;
        calculateFalseReportRate();
    }

    /**
     * Increment rejected reports counter.
     */
    public void incrementRejectedReports() {
        this.rejectedReports++;
        calculateFalseReportRate();
    }

    /**
     * Increment warning counter.
     */
    public void incrementWarningCount() {
        this.warningCount++;
        this.lastWarningAt = LocalDateTime.now();
    }
}
