package com.unicorn.backend.report;

/**
 * Enum representing the status of a report.
 */
public enum ReportStatus {
    PENDING("Awaiting review"),
    UNDER_REVIEW("Being investigated by admin"),
    RESOLVED("Action taken, resolved"),
    REJECTED("Report deemed invalid or false"),
    DISMISSED("No action needed");

    private final String description;

    ReportStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
