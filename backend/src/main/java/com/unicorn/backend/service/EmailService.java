package com.unicorn.backend.service;

public interface EmailService {
    void sendOtp(String to, String otp);
}
