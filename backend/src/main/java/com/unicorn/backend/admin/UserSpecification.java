package com.unicorn.backend.admin;

import com.unicorn.backend.user.User;
import com.unicorn.backend.user.UserModerationLog;
import com.unicorn.backend.user.ModerationActionType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic specification builder for advanced user filtering.
 * Supports filter negation for each field.
 */
public class UserSpecification {

    public static Specification<User> buildSpecification(UserFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Text Filters
            addTextFilter(predicates, criteriaBuilder, root.get("email"),
                    filter.getEmail(), filter.getEmailNegate());

            addTextFilter(predicates, criteriaBuilder, root.get("displayName"),
                    filter.getDisplayName(), filter.getDisplayNameNegate());

            addTextFilter(predicates, criteriaBuilder, root.get("phoneNumber"),
                    filter.getPhoneNumber(), filter.getPhoneNumberNegate());

            addTextFilter(predicates, criteriaBuilder, root.get("country"),
                    filter.getCountry(), filter.getCountryNegate());

            // Select/Enum Filters
            addExactFilter(predicates, criteriaBuilder, root.get("role"),
                    filter.getRole(), filter.getRoleNegate());

            addExactFilter(predicates, criteriaBuilder, root.get("status"),
                    filter.getStatus(), filter.getStatusNegate());

            addExactFilter(predicates, criteriaBuilder, root.get("authProvider"),
                    filter.getAuthProvider(), filter.getAuthProviderNegate());

            addExactFilter(predicates, criteriaBuilder, root.get("suspensionType"),
                    filter.getSuspensionType(), filter.getSuspensionTypeNegate());

            // Date Range Filters
            addDateRangeFilter(predicates, criteriaBuilder, root.get("createdAt"),
                    filter.getCreatedAtFrom(), filter.getCreatedAtTo(), filter.getCreatedAtNegate());

            addDateRangeFilter(predicates, criteriaBuilder, root.get("lastLoginAt"),
                    filter.getLastLoginFrom(), filter.getLastLoginTo(), filter.getLastLoginNegate());

            addDateRangeFilter(predicates, criteriaBuilder, root.get("suspendedAt"),
                    filter.getSuspendedAtFrom(), filter.getSuspendedAtTo(), filter.getSuspendedAtNegate());

            // Boolean Filters - Has Investor Profile
            if (filter.getHasInvestorProfile() != null) {
                Predicate hasProfile = criteriaBuilder.isNotNull(root.get("investorProfile"));
                if (filter.getHasInvestorProfile()) {
                    predicates.add(applyNegation(criteriaBuilder, hasProfile, filter.getHasInvestorProfileNegate()));
                } else {
                    predicates.add(applyNegation(criteriaBuilder, criteriaBuilder.isNull(root.get("investorProfile")),
                            filter.getHasInvestorProfileNegate()));
                }
            }

            // Boolean Filters - Has Startups
            if (filter.getHasStartups() != null) {
                Predicate hasStartups = criteriaBuilder.isNotEmpty(root.get("startups"));
                if (filter.getHasStartups()) {
                    predicates.add(applyNegation(criteriaBuilder, hasStartups, filter.getHasStartupsNegate()));
                } else {
                    predicates.add(applyNegation(criteriaBuilder, criteriaBuilder.isEmpty(root.get("startups")),
                            filter.getHasStartupsNegate()));
                }
            }

            // Boolean Filters - Is Suspended
            if (filter.getIsSuspended() != null) {
                Predicate isSuspended = criteriaBuilder.equal(root.get("status"), "SUSPENDED");
                if (filter.getIsSuspended()) {
                    predicates.add(applyNegation(criteriaBuilder, isSuspended, filter.getIsSuspendedNegate()));
                } else {
                    predicates.add(applyNegation(criteriaBuilder,
                            criteriaBuilder.notEqual(root.get("status"), "SUSPENDED"), filter.getIsSuspendedNegate()));
                }
            }

            // Warning Count Filter
            if (filter.getMinWarningCount() != null) {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<UserModerationLog> subRoot = sub.from(UserModerationLog.class);
                sub.select(criteriaBuilder.count(subRoot));
                sub.where(criteriaBuilder.equal(subRoot.get("user"), root),
                        criteriaBuilder.equal(subRoot.get("actionType"), ModerationActionType.WARNING),
                        criteriaBuilder.equal(subRoot.get("isActive"), true));

                Predicate warningsCheck = criteriaBuilder.greaterThanOrEqualTo(sub,
                        filter.getMinWarningCount().longValue());
                predicates.add(applyNegation(criteriaBuilder, warningsCheck, filter.getMinWarningCountNegate()));
            }

            // Active Session Filter
            if (filter.getHasActiveSession() != null) {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<com.unicorn.backend.security.RefreshToken> subRoot = sub
                        .from(com.unicorn.backend.security.RefreshToken.class);
                sub.select(criteriaBuilder.count(subRoot));
                sub.where(criteriaBuilder.equal(subRoot.get("user"), root),
                        criteriaBuilder.greaterThan(subRoot.get("expiryDate"), java.time.Instant.now()));

                Predicate activeSession = criteriaBuilder.greaterThan(sub, 0L);

                if (filter.getHasActiveSession()) {
                    predicates.add(applyNegation(criteriaBuilder, activeSession, filter.getHasActiveSessionNegate()));
                } else {
                    // Start of logic for "Does NOT have active session"
                    // If filter is false -> we want users with NO active session (count = 0)
                    // If negate is true -> we want users WITH active session
                    Predicate noSession = criteriaBuilder.equal(sub, 0L);
                    predicates.add(applyNegation(criteriaBuilder, noSession, filter.getHasActiveSessionNegate()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addTextFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<String> path, String value, Boolean negate) {
        if (value != null && !value.trim().isEmpty()) {
            Predicate predicate = cb.like(cb.lower(path), "%" + value.toLowerCase() + "%");
            predicates.add(applyNegation(cb, predicate, negate));
        }
    }

    private static void addExactFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<String> path, String value, Boolean negate) {
        if (value != null && !value.trim().isEmpty()) {
            Predicate predicate = cb.equal(path, value);
            predicates.add(applyNegation(cb, predicate, negate));
        }
    }

    private static void addDateRangeFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<LocalDateTime> path, LocalDateTime from,
            LocalDateTime to, Boolean negate) {
        if (from != null || to != null) {
            List<Predicate> datePredicates = new ArrayList<>();

            if (from != null) {
                datePredicates.add(cb.greaterThanOrEqualTo(path, from));
            }
            if (to != null) {
                datePredicates.add(cb.lessThanOrEqualTo(path, to));
            }

            Predicate combined = cb.and(datePredicates.toArray(new Predicate[0]));
            predicates.add(applyNegation(cb, combined, negate));
        }
    }

    private static Predicate applyNegation(CriteriaBuilder cb, Predicate predicate, Boolean negate) {
        if (Boolean.TRUE.equals(negate)) {
            return cb.not(predicate);
        }
        return predicate;
    }
}
