package com.unicorn.backend.startup;

import java.time.LocalDateTime;
import java.util.UUID;

public record StartupMemberResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        String userAvatarUrl,
        String role,
        LocalDateTime joinedAt,
        LocalDateTime leftAt,
        boolean isActive) {
    public static StartupMemberResponse fromEntity(StartupMember member) {
        String fullName = member.getUser().getFirstName() + " " + member.getUser().getLastName();
        return new StartupMemberResponse(
                member.getId(),
                member.getUser().getId(),
                fullName,
                member.getUser().getEmail(),
                member.getUser().getAvatarUrl(),
                member.getRole(),
                member.getJoinedAt(),
                member.getLeftAt(),
                member.isActive());
    }
}
