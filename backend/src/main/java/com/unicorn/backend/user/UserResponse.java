package com.unicorn.backend.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
                UUID id,
                String email,
                String role,
                String status,
                String authProvider,
                LocalDateTime createdAt,
                LocalDateTime lastLoginAt,
                LocalDateTime suspendedAt,
                LocalDateTime suspendedUntil,
                String suspensionType,
                String username,
                String firstName,
                String lastName,
                String displayName,
                String phoneNumber,
                String country,
                String suspendReason,
                boolean hasInvestorProfile,
                boolean hasStartups) {

        public static UserResponse fromEntity(User user) {
                return new UserResponse(
                                user.getId(),
                                user.getEmail(),
                                user.getRole(),
                                user.getStatus(),
                                user.getAuthProvider(),
                                user.getCreatedAt(),
                                user.getLastLoginAt(),
                                user.getSuspendedAt(),
                                user.getSuspendedUntil(),
                                user.getSuspensionType(),
                                user.getUsername(),
                                user.getFirstName(),
                                user.getLastName(),
                                user.getDisplayName(),
                                user.getPhoneNumber(),
                                user.getCountry(),
                                user.getSuspendReason(),
                                user.getInvestorProfile() != null,
                                user.getStartups() != null && !user.getStartups().isEmpty());
        }
}
