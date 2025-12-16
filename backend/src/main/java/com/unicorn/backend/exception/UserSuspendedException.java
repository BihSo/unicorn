package com.unicorn.backend.exception;

import com.unicorn.backend.auth.LoginResponse;
import lombok.Getter;

@Getter
public class UserSuspendedException extends RuntimeException {
    private final LoginResponse loginResponse;

    public UserSuspendedException(LoginResponse loginResponse) {
        super("User is suspended");
        this.loginResponse = loginResponse;
    }
}
