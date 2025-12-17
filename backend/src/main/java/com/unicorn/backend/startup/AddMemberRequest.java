package com.unicorn.backend.startup;

import java.time.LocalDate;
import java.util.UUID;

public record AddMemberRequest(
                UUID userId,
                String role,
                LocalDate joinedAt,
                LocalDate leftAt) {
}
