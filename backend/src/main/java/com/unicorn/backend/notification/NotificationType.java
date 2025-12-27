package com.unicorn.backend.notification;

/**
 * Defines all notification types in the system.
 * Each type represents a distinct category of notification that can be sent to
 * users.
 */
public enum NotificationType {
    // Nudge notifications
    NUDGE_RECEIVED,

    // Report notifications
    REPORT_RESOLVED,
    REPORT_ACTION_TAKEN,

    // Feed notifications
    POST_LIKED,
    POST_COMMENTED,
    COMMENT_LIKED,
    COMMENT_REPLIED,

    // Startup notifications
    STARTUP_FOLLOWED,
    STARTUP_TEAM_INVITE,
    STARTUP_TEAM_JOINED,

    // Investor notifications
    INVESTOR_VERIFICATION_APPROVED,
    INVESTOR_VERIFICATION_REJECTED,
    INVESTOR_PAYMENT_REQUIRED,

    // Admin/Moderation notifications
    ACCOUNT_WARNING,
    ACCOUNT_SUSPENDED,
    ACCOUNT_UNSUSPENDED,

    // Chat notifications
    NEW_CHAT_MESSAGE,

    // System notifications
    SYSTEM_ANNOUNCEMENT
}
