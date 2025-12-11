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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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

	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		return (web) -> web.ignoring().requestMatchers(
				"/api/v1/auth/sign-up",
				"/api/v1/auth/sign-in",
				"/api/v1/auth/sign-out",
				"/api/v1/auth/ping",
				"/api/v1/auth/refresh-token",
				"/actuator/**");
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(
								"/api/v1/auth/sign-up",
								"/api/v1/auth/sign-in",
								"/api/v1/auth/sign-out",
								"/api/v1/auth/refresh-token",
								"/api/v1/auth/ping",
								"/actuator/**")
						.permitAll()
						// suggestion: 기존 permitAll()과 anyRequest().authenticated() 사이에 관리자 권한
						// 설정을 추가합니다.
						// 순서가 중요합니다. 구체적인 경로가 먼저, 포괄적인 경로가 나중에 와야 합니다.
						.requestMatchers("/api/v1/admin/sign-in").permitAll()
						.requestMatchers("/api/v1/admin/new").hasRole("SUPER_ADMIN")
						.requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
						// Customizer에 의해 제외되지 않은 모든 요청은 인증 필요
						.anyRequest().authenticated())
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(jwtAuthenticationEntryPoint))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
