package com.unicorn.backend.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Advanced filter request for user search.
 * Each filter field has a value and optional negation flag.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest {

    // Global Search
    private String globalQuery;

    // Text Filters
    private String email;
    private Boolean emailNegate;

    private String username;
    private Boolean usernameNegate;

    private String firstName;
    private Boolean firstNameNegate;

    private String lastName;
    private Boolean lastNameNegate;

    private String phoneNumber;
    private Boolean phoneNumberNegate;

    private String country;
    private Boolean countryNegate;

    // Select/Enum Filters
    private String role;
    private Boolean roleNegate;

    private String status;
    private Boolean statusNegate;

    private String authProvider;
    private Boolean authProviderNegate;

    private String suspensionType;
    private Boolean suspensionTypeNegate;

    // Date Range Filters
    private LocalDateTime createdAtFrom;
    private LocalDateTime createdAtTo;
    private Boolean createdAtNegate;

    private LocalDateTime lastLoginFrom;
    private LocalDateTime lastLoginTo;
    private Boolean lastLoginNegate;

    private LocalDateTime suspendedAtFrom;
    private LocalDateTime suspendedAtTo;
    private Boolean suspendedAtNegate;

    // Boolean Filters
    private Boolean hasInvestorProfile;
    private Boolean hasInvestorProfileNegate;

    private Boolean hasStartups;
    private Boolean hasStartupsNegate;

    private Boolean isMemberOfStartups;
    private Boolean isMemberOfStartupsNegate;

    private Boolean isVerifiedInvestor;
    private Boolean isVerifiedInvestorNegate;

    private Boolean isSuspended;
    private Boolean isSuspendedNegate;

    private Integer minWarningCount;
    private Boolean minWarningCountNegate; // Less than

    private Boolean hasActiveSession;
    private Boolean hasActiveSessionNegate;

    /**
     * Check if any filter is active.
     */
    public boolean hasAnyFilter() {
        return email != null || username != null || firstName != null || lastName != null ||
                phoneNumber != null || country != null ||
                role != null || status != null || authProvider != null || suspensionType != null ||
                createdAtFrom != null || createdAtTo != null ||
                lastLoginFrom != null || lastLoginTo != null ||
                suspendedAtFrom != null || suspendedAtTo != null ||
                hasInvestorProfile != null || hasStartups != null || isMemberOfStartups != null ||
                isVerifiedInvestor != null || isSuspended != null ||
                minWarningCount != null || hasActiveSession != null;
    }
}
