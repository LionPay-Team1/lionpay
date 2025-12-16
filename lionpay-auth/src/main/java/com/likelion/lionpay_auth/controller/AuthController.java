package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.*;
import com.likelion.lionpay_auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return ResponseEntity.ok("pong");
	}

	// 🚨 수정된 부분: 반환 타입을 Map으로 변경하고 토큰을 반환합니다.
	@PostMapping("/sign-up")
	public ResponseEntity<TokenResponse> signUp(@Valid @RequestBody SignUpRequest request) {
		log.info("회원가입 요청 수신: {}", request);

		// 수정된 AuthService.signUp 호출
		SignInResponse signInResponse = authService.signUp(request);

		// HTTP 201 Created 상태 코드와 함께 토큰을 반환
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new TokenResponse(signInResponse.getAccessToken(), signInResponse.getRefreshToken()));
	}

	@PostMapping("/sign-in")
	public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody SignInRequest request) {
		log.info("로그인 요청 수신: phone={}", request.getPhone());
		SignInResponse signInResponse = authService.signIn(request);

		return ResponseEntity.ok(new TokenResponse(signInResponse.getAccessToken(), signInResponse.getRefreshToken()));
	}

	@PostMapping("/sign-out")
	public ResponseEntity<Void> signOut(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestBody(required = false) SignOutRequest request) {

		// Case 1: SignOut via Access Token (Header)
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String accessToken = authHeader.substring(7);
			log.info("로그아웃 요청 수신 (Access Token 기반)");
			authService.signOut(accessToken);
		}
		// Case 2: SignOut via Refresh Token (Body)
		else if (request != null && request.getRefreshToken() != null) {
			log.info("로그아웃 요청 수신 (Refresh Token 기반)");
			authService.signOutByRefreshToken(request.getRefreshToken());
		}

		return ResponseEntity.ok().build();
	}

	// suggestion: 요청 본문을 String 대신 DTO로 받아 JSON 파싱을 Spring에 위임하고, 유효성 검사를 추가하여 안정성을
	// 높이세요.
	@PostMapping("/refresh-token")
	public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
		log.info("토큰 재발급 요청 수신");

		SignInResponse signInResponse = authService.refreshAccessToken(request.getRefreshToken());

		return ResponseEntity.ok(new TokenResponse(signInResponse.getAccessToken(), signInResponse.getRefreshToken()));
	}
}
