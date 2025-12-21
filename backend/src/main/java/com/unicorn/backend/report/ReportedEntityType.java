package com.unicorn.backend.report;

/**
 * Enum representing the type of entity being reported.
 * This design is extensible - new entity types can be added without schema
 * changes.
 */
public enum ReportedEntityType {
    USER, // Report against a user
    STARTUP; // Report against a startup

    // Future types can be added here without database migration:
    // POST,
    // COMMENT,
    // MESSAGE,
    // etc.
}
