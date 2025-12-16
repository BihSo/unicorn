package com.unicorn.backend.admin;

import com.unicorn.backend.payment.Payment;
import com.unicorn.backend.payment.PaymentRepository;
import com.unicorn.backend.security.RefreshTokenRepository;
import com.unicorn.backend.subscription.Subscription;
import com.unicorn.backend.subscription.SubscriptionRepository;
import com.unicorn.backend.user.*;
import com.unicorn.backend.jwt.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for user moderation operations (suspension, warning, ban, delete).
 */
@Service
@RequiredArgsConstructor
public class UserModerationService {

        private final UserRepository userRepository;
        private final UserModerationLogRepository moderationLogRepository;
        private final RefreshTokenRepository refreshTokenRepository;
        private final SubscriptionRepository subscriptionRepository;
        private final PaymentRepository paymentRepository;
        private final TokenBlacklistService tokenBlacklistService;

        /**
         * Get detailed user information for admin view.
         */
        @Transactional(readOnly = true)
        public UserDetailResponse getUserDetails(UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                List<UserModerationLog> moderationHistory = moderationLogRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);

                long warningCount = moderationLogRepository
                                .countByUserIdAndActionTypeAndIsActiveTrue(userId, ModerationActionType.WARNING);

                // Get current subscription
                Optional<Subscription> currentSubscription = subscriptionRepository.findActiveByUserId(userId);

                // Get recent payments
                List<Payment> recentPayments = paymentRepository.findTop10ByUserIdOrderByTimestampDesc(userId);

                // Check for active sessions
                boolean hasActiveSession = refreshTokenRepository.findByUserId(userId)
                                .stream()
                                .anyMatch(token -> token.getExpiryDate().isAfter(java.time.Instant.now()));

                return UserDetailResponse.fromEntity(
                                user,
                                moderationHistory,
                                warningCount,
                                currentSubscription.orElse(null),
                                recentPayments,
                                hasActiveSession);
        }

        /**
         * Approve an investor for payment.
         */
        @Transactional
        public void approveInvestorForPayment(UUID userId, UUID adminId, String adminEmail) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                if (!"INVESTOR".equals(user.getRole())) {
                        throw new RuntimeException("User is not an investor");
                }

                if (user.getInvestorProfile() == null) {
                        throw new RuntimeException("Investor profile not found");
                }

                user.getInvestorProfile().setReadyForPayment(true);
        }

        /**
         * Suspend a user temporarily or permanently.
         */
        @Transactional
        public UserModerationLog suspendUser(UUID userId, User adminUser, SuspendUserRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Super Admin check
                if (("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
                                && !"SUPER_ADMIN".equals(adminUser.getRole())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Only Super Admins can manage other Admins");
                }

                String previousStatus = user.getStatus();

                // Set suspension details on user
                user.setStatus("SUSPENDED");
                user.setSuspendedAt(LocalDateTime.now());
                user.setSuspendReason(request.getReason());
                user.setSuspensionType(request.isPermanent() ? "PERMANENT" : "TEMPORARY");

                if (!request.isPermanent() && request.getDurationDays() != null) {
                        user.setSuspendedUntil(LocalDateTime.now().plusDays(request.getDurationDays()));
                } else if (!request.isPermanent() && request.getExpiresAt() != null) {
                        user.setSuspendedUntil(request.getExpiresAt());
                } else if (request.isPermanent()) {
                        user.setSuspendedUntil(null); // Permanent has no expiry
                }

                userRepository.save(user);

                // Revoke all access
                refreshTokenRepository.deleteByUserId(userId);
                tokenBlacklistService.revokeUserAccess(userId.toString());

                // Create moderation log
                UserModerationLog log = UserModerationLog.builder()
                                .user(user)
                                .adminId(adminUser.getId())
                                .adminEmail(adminUser.getEmail())
                                .actionType(
                                                request.isPermanent() ? ModerationActionType.PERMANENT_BAN
                                                                : ModerationActionType.SUSPENSION)
                                .reason(request.getReason())
                                .durationType(request.isPermanent() ? "PERMANENT" : "TEMPORARY")
                                .expiresAt(user.getSuspendedUntil())
                                .previousStatus(previousStatus)
                                .newStatus("SUSPENDED")
                                .isActive(true)
                                .build();

                return moderationLogRepository.save(log);
        }

        /**
         * Issue a warning to a user.
         */
        @Transactional
        public UserModerationLog warnUser(UUID userId, User adminUser, WarnUserRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Super Admin check
                if (("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
                                && !"SUPER_ADMIN".equals(adminUser.getRole())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Only Super Admins can warn other Admins");
                }

                // Create warning log
                UserModerationLog log = UserModerationLog.builder()
                                .user(user)
                                .adminId(adminUser.getId())
                                .adminEmail(adminUser.getEmail())
                                .actionType(ModerationActionType.WARNING)
                                .reason(request.getReason())
                                .previousStatus(user.getStatus())
                                .newStatus(user.getStatus()) // Status doesn't change for warnings
                                .isActive(true)
                                .build();

                return moderationLogRepository.save(log);
        }

        /**
         * Remove suspension from a user.
         */
        @Transactional
        public UserModerationLog unsuspendUser(UUID userId, User adminUser, String reason) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Super Admin check
                if (("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
                                && !"SUPER_ADMIN".equals(adminUser.getRole())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Only Super Admins can unsuspend other Admins");
                }

                if (!"SUSPENDED".equals(user.getStatus())) {
                        throw new RuntimeException("User is not suspended");
                }

                String previousStatus = user.getStatus();

                // Deactivate previous suspension log
                UserModerationLog activeSuspension = moderationLogRepository
                                .findFirstByUserIdAndActionTypeAndIsActiveTrueOrderByCreatedAtDesc(
                                                userId, ModerationActionType.SUSPENSION);

                if (activeSuspension != null) {
                        activeSuspension.setIsActive(false);
                        activeSuspension.setRevokedAt(LocalDateTime.now());
                        activeSuspension.setRevokedBy(adminUser.getId());
                        activeSuspension.setRevokeReason(reason);
                        moderationLogRepository.save(activeSuspension);
                }

                // Also check for permanent ban
                UserModerationLog activeBan = moderationLogRepository
                                .findFirstByUserIdAndActionTypeAndIsActiveTrueOrderByCreatedAtDesc(
                                                userId, ModerationActionType.PERMANENT_BAN);

                if (activeBan != null) {
                        activeBan.setIsActive(false);
                        activeBan.setRevokedAt(LocalDateTime.now());
                        activeBan.setRevokedBy(adminUser.getId());
                        activeBan.setRevokeReason(reason);
                        moderationLogRepository.save(activeBan);
                }

                // Restore user
                user.setStatus("ACTIVE");
                user.setSuspendedAt(null);
                user.setSuspendReason(null);
                user.setSuspendedUntil(null);
                user.setSuspensionType(null);
                userRepository.save(user);

                // Create unsuspend log
                UserModerationLog log = UserModerationLog.builder()
                                .user(user)
                                .adminId(adminUser.getId())
                                .adminEmail(adminUser.getEmail())
                                .actionType(ModerationActionType.UNSUSPEND)
                                .reason(reason)
                                .previousStatus(previousStatus)
                                .newStatus("ACTIVE")
                                .isActive(true)
                                .build();

                return moderationLogRepository.save(log);
        }

        /**
         * Soft delete a user - marks as DELETED but keeps in database.
         * User cannot register again with same email.
         */
        @Transactional
        public UserModerationLog softDeleteUser(UUID userId, User adminUser, String reason) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Super Admin check
                if (("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
                                && !"SUPER_ADMIN".equals(adminUser.getRole())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Only Super Admins can delete other Admins");
                }

                String previousStatus = user.getStatus();

                // Soft delete - mark as deleted
                user.setStatus("DELETED");
                user.setDeletedAt(LocalDateTime.now());
                user.setDeletionReason(reason);
                userRepository.save(user);

                // Revoke all access
                refreshTokenRepository.deleteByUserId(userId);
                tokenBlacklistService.revokeUserAccess(userId.toString());

                // Create deletion log
                UserModerationLog log = UserModerationLog.builder()
                                .user(user)
                                .adminId(adminUser.getId())
                                .adminEmail(adminUser.getEmail())
                                .actionType(ModerationActionType.DELETE)
                                .reason(reason)
                                .previousStatus(previousStatus)
                                .newStatus("DELETED")
                                .isActive(true)
                                .build();

                return moderationLogRepository.save(log);
        }

        /**
         * Hard delete a user - permanently removes from database.
         * User can register again with same email.
         */
        @Transactional
        public void hardDeleteUser(UUID userId, User adminUser) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                // Super Admin check
                if (("ADMIN".equals(user.getRole()) || "SUPER_ADMIN".equals(user.getRole()))
                                && !"SUPER_ADMIN".equals(adminUser.getRole())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Only Super Admins can delete other Admins");
                }

                // Delete refresh tokens first (foreign key constraint)
                refreshTokenRepository.deleteByUserId(userId);
                tokenBlacklistService.revokeUserAccess(userId.toString());

                // Delete all moderation logs for this user
                moderationLogRepository.deleteAll(
                                moderationLogRepository.findByUserIdOrderByCreatedAtDesc(userId));

                // Delete the user permanently
                userRepository.delete(user);
        }

        /**
         * Get moderation history for a user.
         */
        @Transactional(readOnly = true)
        public List<ModerationLogResponse> getModerationHistory(UUID userId) {
                List<UserModerationLog> logs = moderationLogRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);

                return logs.stream()
                                .map(ModerationLogResponse::fromEntity)
                                .toList();
        }
}
