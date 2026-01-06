package com.likelion.lionpay_auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward /api/v1/auth/health to /actuator/health
        registry.addViewController("/api/v1/auth/health").setViewName("forward:/actuator/health");
    }
}
