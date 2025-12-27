package com.unicorn.backend.notification;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Data Transfer Object for notification responses.
 * Used for REST API responses and WebSocket messages.
 */
public record NotificationDTO(
        UUID id,
        String type,
        String title,
        String message,
        Map<String, Object> data,
        boolean read,
        LocalDateTime createdAt,
        // Actor information (who triggered the notification)
        UUID actorId,
        String actorName,
        String actorAvatarUrl) {
    /**
     * Create a NotificationDTO from a Notification entity.
     */
    public static NotificationDTO from(Notification notification, Map<String, Object> parsedData) {
        return new NotificationDTO(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                parsedData,
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getActor() != null ? notification.getActor().getId() : null,
                notification.getActorName(),
                notification.getActorAvatarUrl());
    }
}
