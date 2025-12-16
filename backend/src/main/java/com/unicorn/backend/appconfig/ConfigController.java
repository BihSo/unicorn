package com.unicorn.backend.appconfig;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for application configuration management.
 */
@RestController
@RequiredArgsConstructor
public class ConfigController {

    private final AppConfigService configService;

    /**
     * Get public configuration for mobile app.
     * This endpoint is public and used by the mobile app on splash screen.
     * 
     * GET /api/v1/public/config
     */
    @GetMapping("/api/v1/public/config")
    public ResponseEntity<Map<String, Object>> getPublicConfig() {
        Map<String, Object> response = new HashMap<>();
        response.put("version", configService.getVersion());
        response.put("data", configService.getAllAsMap());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all configs for admin dashboard.
     * 
     * GET /api/v1/admin/config
     */
    @GetMapping("/api/v1/admin/config")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AppConfig>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAll());
    }

    /**
     * Get configs grouped by category.
     * 
     * GET /api/v1/admin/config/grouped
     */
    @GetMapping("/api/v1/admin/config/grouped")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, List<AppConfig>>> getConfigsGrouped() {
        return ResponseEntity.ok(configService.getAllGroupedByCategory());
    }

    /**
     * Update a single config value.
     *
     * PUT /api/v1/admin/config/{key}
     */
    @PutMapping("/api/v1/admin/config/{key}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AppConfig> updateConfig(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null) {
            return ResponseEntity.badRequest().build();
        }
        AppConfig updated = configService.updateValue(key, value);
        return ResponseEntity.ok(updated);
    }

    /**
     * Batch update multiple configs.
     * 
     * PUT /api/v1/admin/config
     */
    @PutMapping("/api/v1/admin/config")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> batchUpdateConfigs(@RequestBody Map<String, String> updates) {
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            configService.updateValue(entry.getKey(), entry.getValue());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Configuration updated successfully");
        response.put("version", configService.getVersion());
        response.put("updatedCount", updates.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Create or update a config.
     * 
     * POST /api/v1/admin/config
     */
    @PostMapping("/api/v1/admin/config")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AppConfig> createOrUpdateConfig(@RequestBody ConfigCreateRequest request) {
        AppConfig config = configService.upsert(
                request.getKey(),
                request.getValue(),
                request.getDescription(),
                request.getCategory(),
                request.getValueType());
        return ResponseEntity.ok(config);
    }

    /**
     * Get current config version.
     *
     * GET /api/v1/admin/config/version
     */
    @GetMapping("/api/v1/admin/config/version")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Integer>> getConfigVersion() {
        return ResponseEntity.ok(Map.of("version", configService.getVersion()));
    }

    /**
     * Sync exchange rates from external API.
     * POST /api/v1/admin/config/sync-rates
     */
    @PostMapping("/api/v1/admin/config/sync-rates")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> syncExchangeRates() {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "https://open.er-api.com/v6/latest/USD";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("rates")) {
                return ResponseEntity.status(502).body(Map.of("error", "Failed to fetch rates from external API"));
            }

            Map<String, Number> rates = (Map<String, Number>) response.get("rates");
            List<String> currencies = List.of("SAR", "AED", "EGP", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "MAD");
            Map<String, String> updated = new HashMap<>();

            for (String curr : currencies) {
                if (rates.containsKey(curr)) {
                    String val = String.valueOf(rates.get(curr));
                    configService.updateValue("rate_" + curr.toLowerCase(), val);
                    updated.put(curr, val);
                }
            }
            // Manually fixed logic for LBP if the API returns 89500 instead of old official
            // 15000, we take what API gives.

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
