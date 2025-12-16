package com.unicorn.backend.appconfig;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final AppConfigService appConfigService;

    @GetMapping
    public Map<String, Double> getExchangeRates() {
        return appConfigService.getByCategory("exchange_rates").stream()
                .collect(Collectors.toMap(
                        config -> config.getKey().replace("rate_", "").toUpperCase(),
                        config -> {
                            try {
                                return Double.parseDouble(config.getValue());
                            } catch (NumberFormatException e) {
                                return 1.0; // Fallback
                            }
                        }));
    }
}
