package com.unicorn.backend.auth;

import com.unicorn.backend.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "user_one_time_passwords")
public class UserOneTimePassword {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public UserOneTimePassword(User user, String otpCode, int expiryMinutes) {
        this.user = user;
        this.otpCode = otpCode;
        this.expiryDate = LocalDateTime.now().plusMinutes(expiryMinutes);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
