package com.unicorn.backend.user;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Service for generating and managing user avatars using local assets.
 */
@Service
public class AvatarService {

    private static final List<String> DEFAULT_AVATARS = List.of(
            "/avatars/avatar_1.png",
            "/avatars/avatar_2.png",
            "/avatars/avatar_3.png",
            "/avatars/avatar_4.png");

    private final Random random = new Random();

    /**
     * Generate a deterministic avatar URL based on user ID.
     * Same user ID will always get the same avatar style.
     *
     * @param userId the user's unique identifier
     * @return avatar URL (local path)
     */
    public String getRandomAvatar(UUID userId) {
        long seed = userId.getMostSignificantBits() ^ userId.getLeastSignificantBits();
        Random seededRandom = new Random(seed);
        return DEFAULT_AVATARS.get(seededRandom.nextInt(DEFAULT_AVATARS.size()));
    }

    /**
     * Generate a random avatar URL (non-deterministic).
     *
     * @return random avatar URL (local path)
     */
    public String getRandomAvatar() {
        return DEFAULT_AVATARS.get(random.nextInt(DEFAULT_AVATARS.size()));
    }

    /**
     * Get avatar URL - returns custom avatar if provided, otherwise generates
     * default.
     *
     * @param avatarUrl custom avatar URL (nullable)
     * @param userId    user ID for generating default avatar
     * @return avatar URL (custom or default)
     */
    public String getAvatarUrl(String avatarUrl, UUID userId) {
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            return avatarUrl;
        }
        return getRandomAvatar(userId);
    }
}
