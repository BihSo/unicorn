package com.unicorn.backend.startup;

import java.time.LocalDateTime;
import java.util.UUID;

public record AddMemberRequest(
                UUID userId,
                String role,
                LocalDateTime joinedAt,
                LocalDateTime leftAt) {
}
