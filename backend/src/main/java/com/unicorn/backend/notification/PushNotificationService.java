package com.unicorn.backend.notification;

import com.unicorn.backend.user.User;

import java.util.Map;
import java.util.Set;

/**
 * Interface for push notification service.
 * Designed for future Firebase Cloud Messaging integration.
 */
public interface PushNotificationService {

    /**
     * Send a push notification to a user's device(s).
     *
     * @param recipient The target user
     * @param type      Notification type
     * @param title     Notification title
     * @param message   Notification body
     * @param data      Additional data payload
     * @return true if notification was sent successfully
     */
    boolean sendPush(User recipient, NotificationType type, String title, String message, Map<String, Object> data);

    /**
     * Check if push notifications are enabled for a user.
     */
    boolean isPushEnabled(User user);
}
