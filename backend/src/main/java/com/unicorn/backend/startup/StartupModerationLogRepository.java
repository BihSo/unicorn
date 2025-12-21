package com.unicorn.backend.startup;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StartupModerationLogRepository extends JpaRepository<StartupModerationLog, UUID> {
    List<StartupModerationLog> findByStartupIdOrderByCreatedAtDesc(UUID startupId);
}
