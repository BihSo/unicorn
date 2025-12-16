package com.unicorn.backend.startup;

/**
 * Enum representing the status of a startup.
 */
public enum StartupStatus {
    PENDING,
    APPROVED, // Startup is live and visible
    ACTIVE, // Alias/Same as APPROVED
    REJECTED,
    ARCHIVED
}
