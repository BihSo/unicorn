package com.unicorn.backend.config;

import com.unicorn.backend.appconfig.AppConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ConfigDataInitializer {

    private final AppConfigService appConfigService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        System.out.println("Initializing default application configuration...");
        appConfigService.initializeDefaults();
        // Additional seeds if needed
        // appConfigService.upsertIfNotExists("investor_verification_fee", "50", "Fee
        // for investor verification", "financial", "NUMBER");
    }
}
