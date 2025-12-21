package com.unicorn.backend.service;

public interface EmailService {
    void sendOtp(String to, String otp);

    void sendGenericEmail(String to, String subject, String body);
}
