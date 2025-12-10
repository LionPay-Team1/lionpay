package com.likelion.lionpay_auth.auth.service;

import com.likelion.lionpay_auth.auth.dto.LoginRequest;
import com.likelion.lionpay_auth.auth.dto.LoginResponse;
import com.likelion.lionpay_auth.auth.dto.SignUpRequest;
import com.likelion.lionpay_auth.auth.entity.RefreshToken;
import com.likelion.lionpay_auth.auth.entity.User;
import com.likelion.lionpay_auth.auth.exception.InvalidCredentialsException;
import com.likelion.lionpay_auth.auth.exception.InvalidTokenException;
import com.likelion.lionpay_auth.auth.exception.UserAlreadyExistsException;
import com.likelion.lionpay_auth.auth.repository.RefreshTokenRepository;
import com.likelion.lionpay_auth.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User signUp(SignUpRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistsException("이미 존재하는 사용자입니다");
        }

        User user = User.builder()
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            // [수정] log.error 대신 System.err.println을 사용하여 강제 출력
            System.err.println("!!!!!!!!!!!!!!!!!! AUTH SERVICE CATCH START (DynanoDB 예외) !!!!!!!!!!!!!!!!");
            e.printStackTrace(System.err); // Stack Trace 전체를 표준 오류 스트림에 출력
            System.err.println("!!!!!!!!!!!!!!!!!! AUTH SERVICE CATCH END !!!!!!!!!!!!!!!!");

            // 기존 log.error 코드 유지
            log.error("DynamoDB 저장 중 심각한 예외 발생. 테이블 이름/스키마 불일치 가능성:", e);

            // RuntimeException으로 래핑하여 GlobalExceptionHandler로 전달
            throw new RuntimeException("회원가입 중 서버 오류 발생", e);
        }
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new InvalidCredentialsException("비밀번호가 일치하지 않습니다"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("비밀번호가 일치하지 않습니다");
        }

        String accessToken = jwtService.generateAccessToken(user.getPhone());
        String refreshToken = jwtService.generateRefreshToken(user.getPhone());

        // Refresh Token 저장
        Date expiresAtDate = jwtService.getExpirationFromToken(refreshToken);

        // [수정] String 타입에 맞춰 Unix Timestamp (초 단위)를 문자열로 변환
        String expiresAtString = String.valueOf(expiresAtDate.toInstant().getEpochSecond());

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .phone(user.getPhone())
                .expiresAt(expiresAtString) // String 타입으로 저장
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .phone(user.getPhone())
                .name(user.getName())
                .build();
    }

    public void logout(String accessToken) {
        // Bearer 토큰에서 전화번호 추출
        String phone = jwtService.getPhoneFromToken(accessToken);

        // 해당 사용자의 모든 Refresh Token 삭제 로직은 유지
    }

    public LoginResponse refreshAccessToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new InvalidTokenException("유효하지 않은 리프레시 토큰입니다");
        }

        // [수정] findByToken 대신 findById(PK) 사용 가정
        // (RefreshTokenRepository에 findById가 정의되어 있어야 합니다)
        RefreshToken tokenEntity = refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("제공되어진 리프레시 토큰을 찾을수 없습니다"));

        String phone = tokenEntity.getPhone();
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new InvalidCredentialsException("사용자를 찾을 수 없습니다"));

        String newAccessToken = jwtService.generateAccessToken(phone);
        String newRefreshToken = jwtService.generateRefreshToken(phone);

        // 기존 Refresh Token 삭제
        refreshTokenRepository.delete(refreshToken);

        // 새 Refresh Token 저장
        Date expiresAtDate = jwtService.getExpirationFromToken(newRefreshToken);

        // [수정] String 타입에 맞춰 Unix Timestamp (초 단위)를 문자열로 변환
        String newExpiresAtString = String.valueOf(expiresAtDate.toInstant().getEpochSecond());

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .token(newRefreshToken)
                .phone(user.getPhone())
                .expiresAt(newExpiresAtString)
                .build();
        refreshTokenRepository.save(newRefreshTokenEntity);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .phone(user.getPhone())
                .name(user.getName())
                .build();
    }
}