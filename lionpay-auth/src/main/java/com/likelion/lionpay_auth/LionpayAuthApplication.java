package com.likelion.lionpay_auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class LionpayAuthApplication {

	public static void main(String[] args) {
		SpringApplication.run(LionpayAuthApplication.class, args);
	}
}
