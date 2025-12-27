package com.unicorn.backend.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unicorn.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Central service for managing notifications across the application.
 * Handles notification creation, persistence, retrieval, and real-time
 * delivery.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PushNotificationService pushNotificationService;
    private final ObjectMapper objectMapper;

    private static final String WEBSOCKET_DESTINATION = "/queue/notifications";

    /**
     * Send a notification to a user through specified channels.
     * Default channel is IN_APP only.
     *
     * @param recipient Target user
     * @param type      Notification type
     * @param title     Short notification title
     * @param message   Notification body
     * @param data      Additional metadata (startupId, postId, etc.)
     * @return Created notification DTO
     */
    public NotificationDTO send(User recipient, NotificationType type, String title, String message,
            Map<String, Object> data) {
        return send(recipient, type, title, message, data, null, Set.of(NotificationChannel.IN_APP));
    }

    /**
     * Send a notification with actor information.
     *
     * @param recipient Target user
     * @param type      Notification type
     * @param title     Short notification title
     * @param message   Notification body
     * @param data      Additional metadata
     * @param actor     User who triggered the notification
     * @param channels  Delivery channels
     * @return Created notification DTO
     */
    @Transactional
    public NotificationDTO send(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Map<String, Object> data,
            User actor,
            Set<NotificationChannel> channels) {
        // Validate input
        if (recipient == null) {
            log.warn("Cannot send notification: recipient is null");
            return null;
        }

        // Serialize data to JSON
        String dataJson = null;
        if (data != null && !data.isEmpty()) {
            try {
                dataJson = objectMapper.writeValueAsString(data);
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize notification data: {}", e.getMessage());
            }
        }

        // Create and save notification entity
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .data(dataJson)
                .read(false)
                .actor(actor)
                .actorName(actor != null ? buildActorName(actor) : null)
                .actorAvatarUrl(actor != null ? actor.getAvatarUrl() : null)
                .build();

        notification = notificationRepository.save(notification);
        log.debug("Notification saved: {} for user {}", type, recipient.getId());

        // Create DTO for response
        NotificationDTO dto = NotificationDTO.from(notification, data != null ? data : Map.of());

        // Deliver through channels
        if (channels.contains(NotificationChannel.IN_APP)) {
            sendWebSocket(recipient, dto);
        }

        if (channels.contains(NotificationChannel.PUSH)) {
            pushNotificationService.sendPush(recipient, type, title, message, data);
        }

        return dto;
    }

    /**
     * Get paginated notifications for a user.
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50)); // Max 50 per page
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    /**
     * Get unread notification count for a user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    /**
     * Mark a single notification as read.
     */
    @Transactional
    public boolean markAsRead(UUID notificationId, UUID userId) {
        Optional<Notification> optNotification = notificationRepository.findById(notificationId);
        if (optNotification.isEmpty()) {
            return false;
        }

        Notification notification = optNotification.get();
        // Security check: ensure the notification belongs to the user
        if (!notification.getRecipient().getId().equals(userId)) {
            log.warn("User {} attempted to mark notification {} as read, but it belongs to another user",
                    userId, notificationId);
            return false;
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
        return true;
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    /**
     * Get unread notifications for a user.
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(UUID userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Send notification via WebSocket for real-time delivery.
     */
    private void sendWebSocket(User recipient, NotificationDTO dto) {
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),
                    WEBSOCKET_DESTINATION,
                    dto);
            log.debug("WebSocket notification sent to user: {}", recipient.getUsername());
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to {}: {}", recipient.getUsername(), e.getMessage());
        }
    }

    /**
     * Convert notification entity to DTO.
     */
    private NotificationDTO toDTO(Notification notification) {
        Map<String, Object> data = Map.of();
        if (notification.getData() != null && !notification.getData().isEmpty()) {
            try {
                data = objectMapper.readValue(notification.getData(), new TypeReference<>() {
                });
            } catch (JsonProcessingException e) {
                log.error("Failed to parse notification data: {}", e.getMessage());
            }
        }
        return NotificationDTO.from(notification, data);
    }

    /**
     * Build display name for actor.
     */
    private String buildActorName(User actor) {
        if (actor.getFirstName() != null && actor.getLastName() != null) {
            return actor.getFirstName() + " " + actor.getLastName();
        } else if (actor.getDisplayName() != null) {
            return actor.getDisplayName();
        } else if (actor.getUsername() != null) {
            return actor.getUsername();
        } else {
            return actor.getEmail().split("@")[0];
        }
    }
}
