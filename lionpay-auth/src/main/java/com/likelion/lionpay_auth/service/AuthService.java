package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.dto.SignInRequest;
import com.likelion.lionpay_auth.dto.SignInResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

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
		String accessToken = jwtService.generateAccessToken(savedUser.getPhone());
		String refreshToken = jwtService.generateRefreshToken(savedUser.getPhone());

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
				.orElseThrow(() -> new UserNotFoundException("존재하지 않는 사용자입니다"));

		// 2. 비밀번호 일치 여부 확인: PasswordMismatchException 사용
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new PasswordMismatchException("비밀번호가 일치하지 않습니다");
		}

		// 🚨🚨🚨 핵심 수정: 기존 Refresh Token 전체 삭제 (보안 강화)
		// 로그인 성공 시, 해당 사용자가 보유한 모든 기기의 Refresh Token을 무효화합니다.
		refreshTokenRepository.deleteAllByUserId(user.getUserId());

		String accessToken = jwtService.generateAccessToken(user.getPhone());
		String refreshToken = jwtService.generateRefreshToken(user.getPhone());

		saveRefreshToken(user.getUserId(), refreshToken);

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

			// 전화번호 추출
			String phone = jwtService.getPhoneFromToken(tokenWithoutBearer);
			userRepository.findByPhone(phone).ifPresent(user -> {
				refreshTokenRepository.deleteAllByUserId(user.getUserId());
			});
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

		String phone = jwtService.getSubject(refreshToken);
		User user = userRepository.findByPhone(phone)
				.orElseThrow(() -> new InvalidCredentialsException("사용자를 찾을 수 없습니다"));

		String newAccessToken = jwtService.generateAccessToken(phone);
		String newRefreshToken = jwtService.generateRefreshToken(phone);

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

		rt.setPk("REFRESH_TOKEN#" + userId); // Partition Key 설정
		rt.setSk(token); // Sort Key 설정 (실제 토큰 값)

		rt.setUserId(userId);
		rt.setCreatedAt(Instant.now().toString());
		rt.setExpiresAt(expiresAtString);

		refreshTokenRepository.save(rt);
	}
}
