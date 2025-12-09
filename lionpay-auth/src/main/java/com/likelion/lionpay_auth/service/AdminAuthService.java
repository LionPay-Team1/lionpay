package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.model.dto.AdminCreateRequest;
import com.likelion.lionpay_auth.model.dto.AdminSignInRequest;
import com.likelion.lionpay_auth.model.dto.TokenResponse;
import com.likelion.lionpay_auth.model.entity.AdminEntity;
import com.likelion.lionpay_auth.model.entity.RefreshTokenEntity;
import com.likelion.lionpay_auth.model.repository.AdminRepository;
import com.likelion.lionpay_auth.model.repository.RefreshTokenRepository;
import com.likelion.lionpay_auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-token-expiration-days}")
    private long refreshTokenExpirationDays;

    // "매직 스트링"을 상수로 추출하여 코드의 가독성과 유지보수성을 높입니다.
    private static final String ADMIN_PK_PREFIX = "ADMIN#";
    private static final String RT_PK_PREFIX = "REFRESH_TOKEN#";

    public TokenResponse signIn(AdminSignInRequest req) {
        AdminEntity admin = adminRepository.findByUsername(req.username())
                .orElseThrow(() -> new RuntimeException("ADMIN_NOT_FOUND"));

        if (!passwordEncoder.matches(req.password(), admin.getPasswordHash())) {
            throw new RuntimeException("INVALID_PASSWORD");
        }

        String accessToken = jwtUtil.generateAccessToken(admin.getAdminId(), admin.getUsername());
        String refreshToken = UUID.randomUUID().toString(); // 또는 JWT로 만들어도 됨

        Instant now = Instant.now();
        Instant expiresAt = now.plus(refreshTokenExpirationDays, ChronoUnit.DAYS);

        // refresh token 저장
        RefreshTokenEntity rt = new RefreshTokenEntity();
        // [핵심 수정] 유저와 합의된 'REFRESH_TOKEN#' 접두사를 사용합니다.
        rt.setPk(RT_PK_PREFIX + admin.getAdminId());
        rt.setSk(refreshToken);
        // [핵심 수정] 공용 필드인 userId에 관리자 ID를 저장합니다.
        rt.setUserId(admin.getAdminId());
        rt.setCreatedAt(now.toString());
        rt.setExpiresAt(String.valueOf(expiresAt.getEpochSecond())); // TTL 설정을 위해 만료 시간 저장 (DynamoDB TTL은 epoch seconds 필요)
        refreshTokenRepository.save(rt);

        return new TokenResponse(accessToken, refreshToken);
    }

    public void logout(String adminId, String refreshToken) {
        // Validate that the refresh token exists and belongs to the user, then delete only that token
        String pk = RT_PK_PREFIX + adminId;
        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByPkAndSk(pk, refreshToken)
                .orElseThrow(() -> new RuntimeException("REFRESH_TOKEN_NOT_FOUND"));
        refreshTokenRepository.delete(tokenEntity);
    }

    public String createAdmin(AdminCreateRequest req) {
        // username 중복 체크
        adminRepository.findByUsername(req.username())
                .ifPresent(a -> { throw new RuntimeException("DUPLICATED_ADMIN"); });

        AdminEntity admin = new AdminEntity();
        admin.setPk(ADMIN_PK_PREFIX + req.username());
        admin.setSk("INFO");
        admin.setAdminId(UUID.randomUUID().toString());
        admin.setUsername(req.username());
        admin.setPasswordHash(passwordEncoder.encode(req.password()));
        admin.setName(req.name());
        admin.setCreatedAt(Instant.now().toString());

        adminRepository.save(admin);

        return admin.getAdminId();
    }
}
