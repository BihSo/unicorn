package com.unicorn.backend.jwt;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);

    private final StringRedisTemplate redisTemplate;

    public void blacklistToken(String token, long expirationSeconds) {
        try {
            redisTemplate.opsForValue().set(token, "blacklisted", expirationSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.error("Unexpected error while blacklisting token", e);
        }
    }

    public boolean isTokenBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(token));
        } catch (Exception e) {
            logger.error("Unexpected error while checking token blacklist", e);
            return false;
        }
    }

    // New method to ban user via ID - creates a key "blacklist:user:{id}" with
    // value of revocation timestamp
    public void revokeUserAccess(String userId) {
        try {
            String key = "blacklist:user:" + userId;
            // Set revocation timestamp to NOW.
            // We set expiry to 1 hour (or whatever the max access token duration is) +
            // buffer.
            // Actually, for user ban, we might want it to persist longer or check logic.
            // But usually we just need to invalidate CURRENT tokens. Future tokens are
            // blocked by DB status check.
            // Let's keep it for 24 hours just to be safe.
            redisTemplate.opsForValue().set(key, String.valueOf(System.currentTimeMillis()), 24, TimeUnit.HOURS);
        } catch (Exception e) {
            logger.error("Error revoking user access in Redis", e);
        }
    }

    public boolean isUserRevoked(String userId, long tokenIssuedAt) {
        try {
            String key = "blacklist:user:" + userId;
            String revocationTimeStr = redisTemplate.opsForValue().get(key);
            if (revocationTimeStr != null) {
                long revocationTime = Long.parseLong(revocationTimeStr);
                // If token was issued BEFORE revocation time, it's invalid
                return tokenIssuedAt < revocationTime;
            }
            return false;
        } catch (Exception e) {
            logger.error("Error checking user revocation in Redis", e);
            return false;
        }
    }
}
