package com.unicorn.backend.admin;

import com.unicorn.backend.security.RefreshToken;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SessionResponse {
    private Long id;
    private String tokenPreview; // Last few chars
    private String device; // From User-Agent
    private String ipAddress;
    private Instant lastUsedAt;
    private Instant expiresAt;
    private boolean isCurrent; // Helper to highlight current session if possible? Or just valid.

    public static SessionResponse fromEntity(RefreshToken token) {
        // Simple User-Agent parsing or just return string
        String ua = token.getUserAgent() != null ? token.getUserAgent() : "Unknown";
        if (ua.length() > 50)
            ua = ua.substring(0, 47) + "...";

        return SessionResponse.builder()
                .id(token.getId())
                .tokenPreview("..."
                        + (token.getToken().length() > 8 ? token.getToken().substring(token.getToken().length() - 8)
                                : token.getToken()))
                .device(ua)
                .ipAddress(token.getIpAddress())
                .lastUsedAt(token.getLastUsedAt())
                .expiresAt(token.getExpiryDate())
                .build();
    }
}
