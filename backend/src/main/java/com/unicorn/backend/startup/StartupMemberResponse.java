package com.unicorn.backend.startup;

import java.time.LocalDate;
import java.util.UUID;

public record StartupMemberResponse(
        UUID id,
        UUID userId,
        String userName,
        String userAvatarUrl,
        String role,
        LocalDate joinedAt,
        LocalDate leftAt,
        boolean isActive) {
    public static StartupMemberResponse fromEntity(StartupMember member) {
        String fullName = member.getUser().getFirstName() + " " + member.getUser().getLastName();
        return new StartupMemberResponse(
                member.getId(),
                member.getUser().getId(),
                fullName,
                member.getUser().getAvatarUrl(),
                member.getRole(),
                member.getJoinedAt(),
                member.getLeftAt(),
                member.isActive());
    }
}
