package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.model.dto.TokenResponse;
import com.likelion.lionpay_auth.model.entity.AdminEntity;
import com.likelion.lionpay_auth.model.entity.RefreshTokenEntity;
import com.likelion.lionpay_auth.model.repository.AdminRepository;
import com.likelion.lionpay_auth.model.repository.RefreshTokenRepository;
import com.likelion.lionpay_auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration-days}")
    private long refreshTokenExpirationDays;

    private static final String RT_PK_PREFIX = "REFRESH_TOKEN#";

    /**
     * suggestion: DynamoDB는 Spring의 표준 @Transactional을 지원하지 않으므로 어노테이션을 제거합니다.
     * 토큰 재발급 로직은 여러 단계로 이루어지지만, 중간에 실패하더라도 사용자가 다시 로그인하면 해결되므로
     * 현재 구조에서는 트랜잭션 없이 진행하는 것이 합리적입니다.
     */
    public TokenResponse refreshToken(String oldRefreshToken) {
        // 1. DB에서 리프레시 토큰 조회
        RefreshTokenEntity oldTokenEntity = refreshTokenRepository.findByRefreshToken(oldRefreshToken)
                .orElseThrow(() -> new RuntimeException("TOKEN_NOT_FOUND"));

        // 2. 토큰 만료 시간 검증 (DynamoDB TTL은 약간의 지연이 있을 수 있으므로 코드에서도 검증)
        long expiresAt = Long.parseLong(oldTokenEntity.getExpiresAt());
        if (expiresAt < Instant.now().getEpochSecond()) {
            refreshTokenRepository.delete(oldTokenEntity); // 만료된 토큰은 DB에서 삭제
            throw new RuntimeException("INVALID_TOKEN");
        }

        // 3. 토큰 소유자(관리자) 정보 조회
        // TODO: 나중에 'USER' 타입도 처리하는 로직 추가 필요
        AdminEntity admin = adminRepository.findByAdminId(oldTokenEntity.getUserId())
                .orElseThrow(() -> new RuntimeException("TOKEN_NOT_FOUND")); // 토큰은 있지만 해당 유저가 삭제된 경우

        // 4. 새로운 토큰 생성
        String newAccessToken = jwtUtil.generateAccessToken(admin.getAdminId(), admin.getUsername());
        String newRefreshToken = UUID.randomUUID().toString();

        // 5. 기존 리프레시 토큰 삭제
        refreshTokenRepository.delete(oldTokenEntity);

        // 6. 새로운 리프레시 토큰 저장
        RefreshTokenEntity newRt = new RefreshTokenEntity();
        newRt.setPk(RT_PK_PREFIX + admin.getAdminId());
        newRt.setSk(newRefreshToken);
        newRt.setUserId(admin.getAdminId());
        newRt.setCreatedAt(Instant.now().toString());
        Instant newExpiresAt = Instant.now().plus(refreshTokenExpirationDays, ChronoUnit.DAYS);
        newRt.setExpiresAt(String.valueOf(newExpiresAt.getEpochSecond()));
        refreshTokenRepository.save(newRt);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }
}