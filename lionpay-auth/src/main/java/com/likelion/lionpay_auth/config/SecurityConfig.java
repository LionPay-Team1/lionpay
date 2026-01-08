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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// Forward 요청 허용 (WebMvcConfig의 forward를 위해 필요)
						.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD).permitAll()
						// Swagger/OpenAPI 경로 허용
						.requestMatchers(
								"/swagger.html")
						.permitAll()
						.requestMatchers(
								"/openapi/**",
								"/swagger-ui/**",
								"/swagger.html",
								"/actuator/health",
								"/actuator/**")
						.permitAll()
						.requestMatchers(
								// 인증 API 경로
								"/v1/auth/sign-up",
								"/v1/auth/sign-in",
								"/v1/auth/sign-out",
								"/v1/auth/refresh-token",
								"/v1/auth/health",
								"/v1/auth/info")
						.permitAll()
						// 관리자 토큰 재발급 경로
						.requestMatchers("/v1/admin/refresh-token").permitAll()
						.requestMatchers("/v1/admin/sign-in").permitAll()
						.requestMatchers("/v1/admin/new").hasRole("SUPER_ADMIN")
						.requestMatchers("/v1/admin/admins/**").hasRole("SUPER_ADMIN")
						.requestMatchers("/v1/admin/admins").hasRole("SUPER_ADMIN")
						.requestMatchers("/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
						.anyRequest().authenticated())
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(jwtAuthenticationEntryPoint))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
		org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
		// AllowCredentials가 true일 때는 AllowedOrigins 대신 AllowedOriginPatterns를 사용해야
		// 와일드카드를 쓸 수 있습니다.
		configuration.setAllowedOriginPatterns(java.util.Arrays.asList(
				"https://lionpay.shop",
				"https://admin.lionpay.shop",
				"http://localhost:*",
				"http://*.dev.localhost:*",
				"http://lionpay.dev.localhost:*"));
		configuration.addAllowedMethod("*");
		configuration.addAllowedHeader("*");
		configuration.setAllowCredentials(true);
		org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
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
