package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.dto.SignInRequest;
import com.likelion.lionpay_auth.dto.SignInResponse;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import com.likelion.lionpay_auth.dto.SignUpRequest;
import com.likelion.lionpay_auth.entity.RefreshTokenEntity;
import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.exception.UserNotFoundException;
import com.likelion.lionpay_auth.exception.PasswordMismatchException;
import com.likelion.lionpay_auth.exception.InvalidCredentialsException;
import com.likelion.lionpay_auth.exception.InvalidTokenException;
import com.likelion.lionpay_auth.exception.UserAlreadyExistsException;
import com.likelion.lionpay_auth.repository.RefreshTokenRepository;
import com.likelion.lionpay_auth.repository.UserRepository;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
@Slf4j
public class AuthService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	// OpenTelemetry 커스텀 메트릭: 인증 시도 카운터
	private final LongCounter authCounter;

	public AuthService(
			UserRepository userRepository,
			RefreshTokenRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			Meter meter) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;

		// 커스텀 메트릭 초기화
		this.authCounter = meter.counterBuilder("auth.attempts")
				.setDescription("인증 시도 횟수 (로그인, 회원가입, 토큰 갱신)")
				.setUnit("1")
				.build();
	}

	// 🚨 수정된 부분: SignInResponse를 반환하도록 변경 (이전 수정 반영)
	public SignInResponse signUp(SignUpRequest request) {
		if (userRepository.existsByPhone(request.getPhone())) {
			throw new UserAlreadyExistsException("이미 존재하는 사용자입니다");
		}

		User user = User.builder()
				.phone(request.getPhone())
				.password(passwordEncoder.encode(request.getPassword()))
				.name(request.getName())
				.build();

		user.prePersist();

		// 1. 사용자 저장 (회원가입)
		User savedUser = userRepository.save(user);

		// 2. 토큰 생성
		String accessToken = jwtService.generateAccessToken(savedUser.getUserId());
		String refreshToken = jwtService.generateRefreshToken(savedUser.getUserId());

		// 3. Refresh Token 저장
		saveRefreshToken(savedUser.getUserId(), refreshToken);

		// 4. 토큰과 사용자 정보를 포함하여 응답
		return SignInResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.phone(savedUser.getPhone())
				.name(savedUser.getName())
				.build();
	}

	public SignInResponse signIn(SignInRequest request) {
		// 1. 사용자 존재 여부 확인: UserNotFoundException 사용
		User user = userRepository.findByPhone(request.getPhone())
				.orElseThrow(() -> {
					// 실패 메트릭 기록
					authCounter.add(1, Attributes.of(
							AttributeKey.stringKey("operation"), "signin",
							AttributeKey.stringKey("result"), "user_not_found"));
					return new UserNotFoundException("존재하지 않는 사용자입니다");
				});

		// 2. 비밀번호 일치 여부 확인: PasswordMismatchException 사용
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			// 실패 메트릭 기록
			authCounter.add(1, Attributes.of(
					AttributeKey.stringKey("operation"), "signin",
					AttributeKey.stringKey("result"), "password_mismatch"));
			throw new PasswordMismatchException("비밀번호가 일치하지 않습니다");
		}

		// 🚨🚨🚨 핵심 수정: 기존 Refresh Token 전체 삭제 (보안 강화)
		// 로그인 성공 시, 해당 사용자가 보유한 모든 기기의 Refresh Token을 무효화합니다.
		refreshTokenRepository.deleteAllByUserId(user.getUserId());

		String accessToken = jwtService.generateAccessToken(user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(user.getUserId());

		saveRefreshToken(user.getUserId(), refreshToken);

		// 성공 메트릭 기록
		authCounter.add(1, Attributes.of(
				AttributeKey.stringKey("operation"), "signin",
				AttributeKey.stringKey("result"), "success"));

		return SignInResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.phone(user.getPhone())
				.name(user.getName())
				.build();
	}

	public void signOut(String accessToken) {
		try {
			// Bearer 접두사 제거
			String tokenWithoutBearer = accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken;

			// UserId 추출
			String userId = jwtService.getSubject(tokenWithoutBearer);
			refreshTokenRepository.deleteAllByUserId(userId);
		} catch (Exception e) {
			log.warn("SignOut failed", e);
		}
	}

	public void signOutByRefreshToken(String refreshToken) {
		refreshTokenRepository.deleteByToken(refreshToken);
	}

	public SignInResponse refreshAccessToken(String refreshToken) {
		if (!jwtService.validateToken(refreshToken)) {
			throw new InvalidTokenException("유효하지 않은 리프레시 토큰입니다");
		}

		RefreshTokenEntity tokenEntity = refreshTokenRepository.findByRefreshToken(refreshToken)
				.orElseThrow(() -> new InvalidTokenException("제공되어진 리프레시 토큰을 찾을수 없습니다"));

		String userId = jwtService.getSubject(refreshToken);
		User user = userRepository.findByUserId(userId) // Note: This repository method needs to be checked/added
				.orElseThrow(() -> new InvalidCredentialsException("사용자를 찾을 수 없습니다"));

		String newAccessToken = jwtService.generateAccessToken(userId);
		String newRefreshToken = jwtService.generateRefreshToken(userId);

		refreshTokenRepository.delete(tokenEntity);
		saveRefreshToken(user.getUserId(), newRefreshToken);

		return SignInResponse.builder()
				.accessToken(newAccessToken)
				.refreshToken(newRefreshToken)
				.phone(user.getPhone())
				.name(user.getName())
				.build();
	}

	private void saveRefreshToken(String userId, String token) {
		Date expiresAtDate = jwtService.getExpirationFromToken(token);
		String expiresAtString = String.valueOf(expiresAtDate.toInstant().getEpochSecond());

		RefreshTokenEntity rt = new RefreshTokenEntity();

		// suggestion: 단일 테이블 설계에 맞게 PK와 SK를 설정합니다.
		rt.setPk(DynamoDBConstants.USER_PREFIX + userId);
		rt.setSk(DynamoDBConstants.REFRESH_TOKEN_SK);

		rt.setUserId(userId);
		rt.setToken(token); // 실제 토큰은 별도 속성에 저장
		rt.setCreatedAt(Instant.now().toString());
		rt.setExpiresAt(expiresAtString);

		refreshTokenRepository.save(rt);
	}
}
