package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.security.JwtAuthenticationEntryPoint;
import com.likelion.lionpay_auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

        // [핵심 해결] 1. WebSecurityCustomizer를 사용하여 특정 경로를 필터 체인에서 완전히 제외
        @Bean
        public WebSecurityCustomizer webSecurityCustomizer() {
                return (web) -> web.ignoring().requestMatchers(
                                "/api/v1/auth/sign-up",
                                "/api/v1/auth/login",
                                "/api/v1/auth/logout",
                                "/api/v1/auth/ping",
                                "/api/v1/auth/refresh-token", // <--- 이 경로를 추가했습니다.
                                "/actuator/**");
        }

        // 2. JWT 필터와 인증/인가가 필요한 나머지 모든 경로를 처리하는 단일 필터 체인
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // 인증 없이 접근 가능한 엔드포인트
                                                .requestMatchers(
                                                                "/api/v1/auth/sign-up",
                                                                "/api/v1/auth/sign-in",
                                                                "/api/v1/auth/login",
                                                                "/api/v1/auth/refresh-token",
                                                                "/api/v1/auth/ping",
                                                                "/api/test/**",
                                                                "/actuator/**")
                                                .permitAll()
                                                // Customizer에 의해 제외되지 않은 모든 요청은 인증 필요
                                                .anyRequest().authenticated())
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
