package com.unicorn.backend.admin;

import com.unicorn.backend.security.RefreshToken;
import com.unicorn.backend.security.RefreshTokenRepository;
import com.unicorn.backend.user.User;
import com.unicorn.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SecurityAdminController {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    /**
     * Get active sessions (refresh tokens) for a user.
     */
    @GetMapping("/{userId}/sessions")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);

        // Filter only active tokens? Or show all present in DB (assuming DB cleaned up
        // or we filter by expiry)
        // Let's filter by expiry to be safe
        List<SessionResponse> sessions = tokens.stream()
                .filter(t -> t.getExpiryDate().isAfter(java.time.Instant.now()))
                .map(SessionResponse::fromEntity)
                .sorted((a, b) -> b.getLastUsedAt() != null && a.getLastUsedAt() != null
                        ? b.getLastUsedAt().compareTo(a.getLastUsedAt())
                        : 0)
                .collect(Collectors.toList());

        return ResponseEntity.ok(sessions);
    }

    /**
     * Revoke all sessions for a user (Force Logout).
     */
    @DeleteMapping("/{userId}/sessions")
    @Transactional
    public ResponseEntity<Void> revokeAllSessions(@PathVariable UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        refreshTokenRepository.deleteByUserId(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Revoke a specific session.
     */
    @DeleteMapping("/{userId}/sessions/{sessionId}")
    @Transactional
    public ResponseEntity<Void> revokeSession(@PathVariable UUID userId, @PathVariable Long sessionId) {
        // Verify token belongs to user
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!token.getUser().getId().equals(userId)) {
            throw new RuntimeException("Session does not belong to user");
        }

        refreshTokenRepository.delete(token);
        return ResponseEntity.ok().build();
    }
}
