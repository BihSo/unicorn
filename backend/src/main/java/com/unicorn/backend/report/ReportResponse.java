package com.unicorn.backend.report;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private UUID id;
    private UUID reporterId;
    private ReportedEntityType reportedEntityType;
    private UUID reportedEntityId;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private AdminAction adminAction;
    private UUID adminId;
    private String adminNotes;
    private String actionDetails;
    private Boolean notifyReporter;
    private Boolean reporterNotified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    // Enriched fields
    private String reporterName;
    private String reporterImage;
    private String reportedEntityName;
    private String reportedEntityImage;
    private String reportedEntityStatus;
}
