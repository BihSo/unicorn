package com.unicorn.backend.notification;

import com.unicorn.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for notification management.
 * Provides endpoints for fetching, reading, and managing user notifications.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the authenticated user.
     *
     * @param user Current authenticated user
     * @param page Page number (0-indexed)
     * @param size Page size (max 50)
     * @return Page of notifications
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(user.getId(), page, size);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for the authenticated user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Get all unread notifications for the authenticated user.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    /**
     * Mark a single notification as read.
     *
     * @param user           Current authenticated user
     * @param notificationId ID of the notification to mark as read
     * @return Success status
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable UUID notificationId) {
        boolean success = notificationService.markAsRead(notificationId, user.getId());
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification marked as read"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Notification not found or access denied"));
        }
    }

    /**
     * Mark all notifications as read for the authenticated user.
     *
     * @param user Current authenticated user
     * @return Count of notifications marked as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@AuthenticationPrincipal User user) {
        int count = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "All notifications marked as read",
                "count", count));
    }
}
