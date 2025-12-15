package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.dto.AdminCreateRequest;
import com.likelion.lionpay_auth.dto.AdminSignInRequest;
import com.likelion.lionpay_auth.dto.TokenResponse;
import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import com.likelion.lionpay_auth.exception.InvalidTokenException;
import com.likelion.lionpay_auth.exception.AdminNotFoundException;
import com.likelion.lionpay_auth.exception.DuplicateAdminException;
import com.likelion.lionpay_auth.exception.PasswordMismatchException;
import com.likelion.lionpay_auth.exception.RefreshTokenNotFoundException;
import com.likelion.lionpay_auth.enums.AdminRole;
import com.likelion.lionpay_auth.entity.RefreshTokenEntity;
import com.likelion.lionpay_auth.repository.AdminRepository;
import com.likelion.lionpay_auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public TokenResponse signIn(AdminSignInRequest req) {
        AdminEntity admin = adminRepository.findByUsername(req.username())
                .orElseThrow(() -> new AdminNotFoundException("존재하지 않는 관리자입니다."));

        if (!passwordEncoder.matches(req.password(), admin.getPasswordHash())) {
            throw new PasswordMismatchException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtService.generateAccessToken(admin.getAdminId(), admin.getUsername(), admin.getRole());
        String refreshToken = jwtService.generateRefreshToken(admin.getAdminId()); // Subject for admin token is adminId

        saveRefreshToken(admin.getAdminId(), refreshToken);

        return new TokenResponse(accessToken, refreshToken);
    }

    public void logout(String adminId, String refreshToken) {
        // suggestion: 리프레시 토큰의 SK는 고정값이므로, PK와 고정된 SK로 조회한 후 토큰 문자열을 비교하여 삭제합니다.
        String pk = DynamoDBConstants.USER_PREFIX + adminId;
        String sk = DynamoDBConstants.REFRESH_TOKEN_SK;

        refreshTokenRepository.findByPkAndSk(pk, sk)
                .filter(tokenEntity -> tokenEntity.getToken().equals(refreshToken)) // DB의 토큰과 요청의 토큰이 일치하는지 확인
                .ifPresentOrElse(
                        refreshTokenRepository::delete, // 토큰이 존재하고 일치하면 삭제
                        () -> { throw new RefreshTokenNotFoundException("이미 로그아웃되었거나 유효하지 않은 토큰입니다."); }
                );
    }

    public AdminEntity createAdmin(AdminCreateRequest req) {
        adminRepository.findByUsername(req.username())
                .ifPresent(a -> {
                    throw new DuplicateAdminException("이미 존재하는 관리자 아이디입니다.");
                });

        AdminEntity admin = new AdminEntity();
        // suggestion: 단일 테이블 설계에 맞게 PK와 SK를 설정합니다.
        admin.setPk(DynamoDBConstants.ADMIN_PREFIX + req.username());
        admin.setSk(DynamoDBConstants.INFO_SK);
        admin.setAdminId(UUID.randomUUID().toString());
        admin.setUsername(req.username());
        admin.setPasswordHash(passwordEncoder.encode(req.password()));
        admin.setName(req.name());
        admin.setRole(AdminRole.ADMIN); // 새로 생성되는 관리자는 기본적으로 ADMIN 역할
        admin.setCreatedAt(Instant.now().toString());

        adminRepository.save(admin);

        return admin;
    }

    // suggestion: 관리자 전용 토큰 재발급 로직을 추가합니다.
    public TokenResponse refreshAdminToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new InvalidTokenException("유효하지 않은 리프레시 토큰입니다.");
        }

        // suggestion: 리프레시 토큰을 조회할 때, PK/SK가 아닌 GSI(byRefreshToken 인덱스)를 사용해야 합니다.
        // 1. GSI를 사용하여 리프레시 토큰 문자열로 엔티티를 조회합니다.
        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("DB에 존재하지 않거나 만료된 토큰입니다."));

        // 2. 토큰의 주체(adminId)로 관리자 정보 조회
        AdminEntity admin = adminRepository.findByAdminId(tokenEntity.getUserId())
                .orElseThrow(() -> new AdminNotFoundException("해당 토큰의 관리자를 찾을 수 없습니다."));

        // 3. 새로운 토큰 생성
        String newAccessToken = jwtService.generateAccessToken(admin.getAdminId(), admin.getUsername(), admin.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(admin.getAdminId());

        // 4. 기존 토큰 삭제 및 새 토큰 저장 (토큰 순환)
        refreshTokenRepository.delete(tokenEntity);
        saveRefreshToken(admin.getAdminId(), newRefreshToken);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    private void saveRefreshToken(String adminId, String token) {
        Date expiresAtDate = jwtService.getExpirationFromToken(token);
        String expiresAtString = String.valueOf(expiresAtDate.toInstant().getEpochSecond());

        RefreshTokenEntity rt = new RefreshTokenEntity();
        // suggestion: 단일 테이블 설계에 맞게 PK와 SK를 설정합니다.
        rt.setPk(DynamoDBConstants.USER_PREFIX + adminId); // Admin의 리프레시 토큰도 User ID 기반으로 저장
        rt.setSk(DynamoDBConstants.REFRESH_TOKEN_SK);
        rt.setUserId(adminId);
        rt.setToken(token);
        rt.setCreatedAt(Instant.now().toString());
        rt.setExpiresAt(expiresAtString);

        refreshTokenRepository.save(rt);
    }
}
