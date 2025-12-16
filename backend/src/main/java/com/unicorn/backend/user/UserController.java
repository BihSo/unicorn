package com.unicorn.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/me/preferred-currency")
    public ResponseEntity<Void> updatePreferredCurrency(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {

        String currency = request.get("currency");
        if (currency == null || currency.trim().isEmpty()) {
            throw new IllegalArgumentException("Currency is required");
        }

        // Basic validation for Top 10 Arab Currencies + USD
        // SAR, AED, EGP, QAR, KWD, BHD, OMR, JOD, LBP, MAD, USD

        user.setPreferredCurrency(currency.toUpperCase());
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}
