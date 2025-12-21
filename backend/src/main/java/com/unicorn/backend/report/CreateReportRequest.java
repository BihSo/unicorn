package com.unicorn.backend.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new report.
 */
public record CreateReportRequest(
        @NotNull(message = "Report reason is required") ReportReason reason,

        @NotBlank(message = "Description is required") @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters") String description) {
}
