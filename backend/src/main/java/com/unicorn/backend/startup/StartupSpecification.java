package com.unicorn.backend.startup;

import com.unicorn.backend.user.User;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic specification builder for advanced startup filtering.
 */
public class StartupSpecification {

    public static Specification<Startup> buildSpecification(StartupFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Global Query Search
            if (filter.getGlobalQuery() != null && !filter.getGlobalQuery().trim().isEmpty()) {
                String q = "%" + filter.getGlobalQuery().trim().toLowerCase() + "%";
                Predicate searchPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("tagline")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("industry")), q),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("fullDescription")), q));
                // Also search owner email?
                Join<Startup, User> ownerJoin = root.join("owner", JoinType.LEFT);
                Predicate ownerSearch = criteriaBuilder.like(criteriaBuilder.lower(ownerJoin.get("email")), q);

                predicates.add(criteriaBuilder.or(searchPredicate, ownerSearch));
            }

            // Text Filters
            addTextFilter(predicates, criteriaBuilder, root.get("name"),
                    filter.getName(), filter.getNameNegate());

            addTextFilter(predicates, criteriaBuilder, root.get("industry"),
                    filter.getIndustry(), filter.getIndustryNegate());

            // Owner Email Filter (Requires Join)
            if (filter.getOwnerEmail() != null && !filter.getOwnerEmail().trim().isEmpty()) {
                Join<Startup, User> owner = root.join("owner", JoinType.LEFT);
                String[] parts = filter.getOwnerEmail().split(",");
                List<Predicate> orPredicates = new ArrayList<>();
                for (String part : parts) {
                    if (!part.trim().isEmpty()) {
                        orPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(owner.get("email")),
                                "%" + part.trim().toLowerCase() + "%"));
                    }
                }
                if (!orPredicates.isEmpty()) {
                    Predicate combined = criteriaBuilder.or(orPredicates.toArray(new Predicate[0]));
                    predicates.add(applyNegation(criteriaBuilder, combined, filter.getOwnerEmailNegate()));
                }
            }

            // Member Email Filter (Requires Join on StartupMember -> User)
            if (filter.getMemberEmail() != null && !filter.getMemberEmail().trim().isEmpty()) {
                Join<Startup, StartupMember> members = root.join("members", JoinType.LEFT);
                Join<StartupMember, User> memberUser = members.join("user", JoinType.LEFT);
                String[] parts = filter.getMemberEmail().split(",");
                List<Predicate> orPredicates = new ArrayList<>();
                for (String part : parts) {
                    if (!part.trim().isEmpty()) {
                        orPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(memberUser.get("email")),
                                "%" + part.trim().toLowerCase() + "%"));
                    }
                }
                if (!orPredicates.isEmpty()) {
                    Predicate combined = criteriaBuilder.or(orPredicates.toArray(new Predicate[0]));
                    predicates.add(applyNegation(criteriaBuilder, combined, filter.getMemberEmailNegate()));
                }
            }

            // Enum Filters
            addExactFilter(predicates, criteriaBuilder, root.get("stage"),
                    filter.getStage(), filter.getStageNegate());

            addExactFilter(predicates, criteriaBuilder, root.get("status"),
                    filter.getStatus(), filter.getStatusNegate());

            // Numeric Range Filters
            addRangeFilter(predicates, criteriaBuilder, root.get("fundingGoal"),
                    filter.getFundingGoalMin(), filter.getFundingGoalMax(), filter.getFundingGoalNegate());

            addRangeFilter(predicates, criteriaBuilder, root.get("raisedAmount"),
                    filter.getRaisedAmountMin(), filter.getRaisedAmountMax(), filter.getRaisedAmountNegate());

            // Date Range Filters
            addDateRangeFilter(predicates, criteriaBuilder, root.get("createdAt"),
                    filter.getCreatedAtFrom(), filter.getCreatedAtTo(), filter.getCreatedAtNegate());

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addTextFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<String> path, String value, Boolean negate) {
        if (value != null && !value.trim().isEmpty()) {
            String[] parts = value.split(",");
            List<Predicate> orPredicates = new ArrayList<>();
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    orPredicates.add(cb.like(cb.lower(path), "%" + part.trim().toLowerCase() + "%"));
                }
            }
            if (!orPredicates.isEmpty()) {
                Predicate combined = cb.or(orPredicates.toArray(new Predicate[0]));
                predicates.add(applyNegation(cb, combined, negate));
            }
        }
    }

    private static void addExactFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<?> path, String value, Boolean negate) {
        if (value != null && !value.trim().isEmpty()) {
            // Handle Enums by converting string value to Enum if possible, or string
            // comparison if stored as String
            // Startup.stage is Enum, Startup.status is Enum.
            // In Criteria API with Enums, pass the Enum constant or String?
            // Usually pass String if using .as(String.class) or Enum object.
            // Let's assume generic string value needs to be parsed?
            // Better: Compare as string.
            Predicate predicate = cb.equal(path.as(String.class), value);
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

    private static void addRangeFilter(List<Predicate> predicates, CriteriaBuilder cb,
            Path<BigDecimal> path, BigDecimal min, BigDecimal max, Boolean negate) {
        if (min != null || max != null) {
            List<Predicate> rangePredicates = new ArrayList<>();
            if (min != null) {
                rangePredicates.add(cb.greaterThanOrEqualTo(path, min));
            }
            if (max != null) {
                rangePredicates.add(cb.lessThanOrEqualTo(path, max));
            }
            Predicate combined = cb.and(rangePredicates.toArray(new Predicate[0]));
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
