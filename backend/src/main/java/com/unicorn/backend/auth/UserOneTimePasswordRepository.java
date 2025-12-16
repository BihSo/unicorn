package com.unicorn.backend.auth;

import com.unicorn.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserOneTimePasswordRepository extends JpaRepository<UserOneTimePassword, UUID> {
    Optional<UserOneTimePassword> findByUser(User user);

    void deleteByUser(User user);
}
