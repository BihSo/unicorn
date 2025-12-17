package com.unicorn.backend.startup;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface StartupMemberRepository extends JpaRepository<StartupMember, UUID> {
    List<StartupMember> findByStartupId(UUID startupId);

    List<StartupMember> findByUserId(UUID userId);
}
