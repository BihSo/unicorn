package com.unicorn.backend.startup;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Advanced filter request for startup search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartupFilterRequest {

    // Global Search
    private String globalQuery;

    // Text Filters
    private String name;
    private Boolean nameNegate;

    private String industry;
    private Boolean industryNegate;

    private String ownerEmail;
    private Boolean ownerEmailNegate;

    private String memberEmail;
    private Boolean memberEmailNegate;

    // Enum Filters
    private String stage;
    private Boolean stageNegate;

    private String status;
    private Boolean statusNegate;

    // Range Filters - Funding Goal
    private BigDecimal fundingGoalMin;
    private BigDecimal fundingGoalMax;
    private Boolean fundingGoalNegate; // Not strictly needed for ranges? Logic-wise: "Not in Range"

    // Range Filters - Raised Amount
    private BigDecimal raisedAmountMin;
    private BigDecimal raisedAmountMax;
    private Boolean raisedAmountNegate;

    // Date Filters
    private LocalDateTime createdAtFrom;
    private LocalDateTime createdAtTo;
    private Boolean createdAtNegate;

    /**
     * Check if any filter is active.
     */
    public boolean hasAnyFilter() {
        return globalQuery != null || name != null || industry != null || ownerEmail != null || memberEmail != null ||
                stage != null || status != null ||
                fundingGoalMin != null || fundingGoalMax != null ||
                raisedAmountMin != null || raisedAmountMax != null ||
                createdAtFrom != null || createdAtTo != null;
    }
}
