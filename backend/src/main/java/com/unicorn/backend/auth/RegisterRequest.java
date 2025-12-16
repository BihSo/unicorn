package com.unicorn.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,

        @NotBlank(message = "Password is required") String password,

        // Optional: Role can be restricted or allow default 'USER'
        String role,

        String username,
        String firstName,
        String lastName,

        String phoneNumber,
        String country,

        // Common Profile Fields
        String bio,
        String linkedInUrl,

        // Investor Specific Fields
        java.math.BigDecimal investmentBudget,
        String preferredIndustries,
        String preferredStage) {
}
