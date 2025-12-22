package com.likelion.lionpay_auth.config;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenTelemetryConfig {

    @Bean
    public Meter meter() {
        return GlobalOpenTelemetry.getMeter("lionpay.auth");
    }
}
