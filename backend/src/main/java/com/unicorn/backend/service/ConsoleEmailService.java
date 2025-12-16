package com.unicorn.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConsoleEmailService implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(ConsoleEmailService.class);

    @Override
    public void sendOtp(String to, String otp) {
        logger.info("========================================");
        logger.info("EMAIL MOCK - Sending OTP to: {}", to);
        logger.info("OTP CODE: {}", otp);
        logger.info("========================================");
    }
}
