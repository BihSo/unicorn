package com.unicorn.backend.report;

/**
 * Enum representing the action taken by admin on a report.
 */
public enum AdminAction {
    NO_ACTION("No violation found, no action taken"),
    WARNING("Warning issued to reported entity"),
    CONTENT_REMOVED("Specific content removed"),
    ACCOUNT_SUSPENDED("Account temporarily suspended"),
    ACCOUNT_BANNED("Account permanently banned"),
    STARTUP_SUSPENDED("Startup suspended"),
    STARTUP_DELETED("Startup deleted");

    private final String description;

    AdminAction(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
