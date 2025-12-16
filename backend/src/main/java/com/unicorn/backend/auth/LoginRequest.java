package com.unicorn.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
                @NotBlank(message = "Email or Username is required!") String email,

                @NotBlank(message = "Password is required") String password) {
}
