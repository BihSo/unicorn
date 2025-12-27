package com.unicorn.backend.notification;

/**
 * Defines the channels through which notifications can be delivered.
 * Designed to support multi-channel notification delivery.
 */
public enum NotificationChannel {
    /**
     * In-app notification via WebSocket + Database persistence.
     * Always available.
     */
    IN_APP,

    /**
     * Push notification via Firebase Cloud Messaging.
     * Requires FCM token registration from mobile app.
     */
    PUSH,

    /**
     * Email notification via SMTP.
     * Reserved for future implementation.
     */
    EMAIL
}
