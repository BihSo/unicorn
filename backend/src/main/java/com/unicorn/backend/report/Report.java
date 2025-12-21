package com.unicorn.backend.report;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a report submitted by a user against another entity.
 * Uses a polymorphic design for extensibility - can report any entity type.
 */
@Entity
@Table(name = "reports", indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_reporter", columnList = "reporter_id"),
        @Index(name = "idx_entity_type", columnList = "reported_entity_type"),
        @Index(name = "idx_entity_id", columnList = "reported_entity_id"),
        @Index(name = "idx_entity_type_id", columnList = "reported_entity_type, reported_entity_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reported_entity_type", nullable = false, length = 30)
    private ReportedEntityType reportedEntityType;

    @Column(name = "reported_entity_id", nullable = false)
    private UUID reportedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportReason reason;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_action", length = 30)
    private AdminAction adminAction;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "action_details", columnDefinition = "TEXT")
    private String actionDetails;

    @Column(name = "notify_reporter")
    @Builder.Default
    private Boolean notifyReporter = true;

    @Column(name = "reporter_notified")
    @Builder.Default
    private Boolean reporterNotified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
