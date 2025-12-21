package com.unicorn.backend.startup;

import com.unicorn.backend.user.ModerationActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity to track startup moderation history (warnings, status changes).
 */
@Entity
@Table(name = "startup_moderation_logs", indexes = {
        @Index(name = "idx_moderation_startup", columnList = "startup_id"),
        @Index(name = "idx_moderation_startup_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartupModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Startup startup;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "admin_email")
    private String adminEmail;

    @Column(name = "action_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private ModerationActionType actionType;

    @Column(name = "reason", length = 2000)
    private String reason;

    @Column(name = "previous_status", length = 20)
    private String previousStatus;

    @Column(name = "new_status", length = 20)
    private String newStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
