package com.unicorn.backend.notification;

import com.unicorn.backend.user.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Stub implementation of PushNotificationService.
 * Replace with actual Firebase implementation when ready.
 */
@Service
@Slf4j
public class PushNotificationServiceStub implements PushNotificationService {

    @Override
    public boolean sendPush(User recipient, NotificationType type, String title, String message,
            Map<String, Object> data) {
        // TODO: Implement Firebase Cloud Messaging integration
        // 1. Get user's FCM token(s) from database
        // 2. Build FCM message with title, body, and data
        // 3. Send via FirebaseMessaging.getInstance().send()
        log.debug("Push notification stub: would send '{}' to user {}", title, recipient.getId());
        return false; // Return false since push is not actually sent
    }

    @Override
    public boolean isPushEnabled(User user) {
        // TODO: Check if user has registered FCM token
        return false;
    }
}
