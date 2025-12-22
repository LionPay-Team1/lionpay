package com.likelion.lionpay_auth;

import com.likelion.lionpay_auth.config.TestOpenTelemetryConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestOpenTelemetryConfig.class)
class LionpayAuthApplicationTests {

	@Test
	void contextLoads() {
	}

}
