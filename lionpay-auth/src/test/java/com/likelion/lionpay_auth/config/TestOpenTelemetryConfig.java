package com.likelion.lionpay_auth.config;

import io.opentelemetry.api.OpenTelemetry;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Test configuration that provides a no-op OpenTelemetry instance.
 * In production, OpenTelemetry is provided by the Java agent or Aspire
 * infrastructure.
 * For tests, we use the noop implementation.
 */
@TestConfiguration
public class TestOpenTelemetryConfig {

    @Bean
    @Primary
    public OpenTelemetry openTelemetry() {
        return OpenTelemetry.noop();
    }
}
