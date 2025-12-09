package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // [핵심 수정] JWT 인증 필터를 주입받습니다.
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // ✅ 관리자 생성, 로그인은 인증 없이 허용해야 함
                        .requestMatchers("/api/v1/admin/new").permitAll()
                        .requestMatchers("/api/v1/admin/sign-in").permitAll()
                        .requestMatchers("/api/v1/admin/sign-out").authenticated()
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                // [핵심 수정] UsernamePasswordAuthenticationFilter 앞에 JwtAuthFilter를 추가하여 토큰을 먼저 검증하도록 설정합니다.
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
