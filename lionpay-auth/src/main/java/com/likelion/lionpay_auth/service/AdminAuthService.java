package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.dto.AdminCreateRequest;
import com.likelion.lionpay_auth.dto.AdminSignInRequest;
import com.likelion.lionpay_auth.dto.TokenResponse;
import com.likelion.lionpay_auth.entity.AdminEntity;
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

    private static final String ADMIN_PK_PREFIX = "ADMIN#";
    private static final String RT_PK_PREFIX = "REFRESH_TOKEN#";

    public TokenResponse signIn(AdminSignInRequest req) {
        AdminEntity admin = adminRepository.findByUsername(req.username())
                .orElseThrow(() -> new RuntimeException("ADMIN_NOT_FOUND"));

        if (!passwordEncoder.matches(req.password(), admin.getPasswordHash())) {
            throw new RuntimeException("INVALID_PASSWORD");
        }

        String accessToken = jwtService.generateAccessToken(admin.getAdminId(), admin.getUsername());
        String refreshToken = jwtService.generateRefreshToken(admin.getAdminId()); // Subject for admin token is adminId

        saveRefreshToken(admin.getAdminId(), refreshToken);

        return new TokenResponse(accessToken, refreshToken);
    }

    public void logout(String adminId, String refreshToken) {
        String pk = RT_PK_PREFIX + adminId;
        refreshTokenRepository.findByPkAndSk(pk, refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    public String createAdmin(AdminCreateRequest req) {
        adminRepository.findByUsername(req.username())
                .ifPresent(a -> {
                    throw new RuntimeException("DUPLICATED_ADMIN");
                });

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

    private void saveRefreshToken(String adminId, String token) {
        Date expiresAtDate = jwtService.getExpirationFromToken(token);
        String expiresAtString = String.valueOf(expiresAtDate.toInstant().getEpochSecond());

        RefreshTokenEntity rt = new RefreshTokenEntity();
        rt.setPk(RT_PK_PREFIX + adminId);
        rt.setSk(token);
        rt.setUserId(adminId);
        rt.setCreatedAt(Instant.now().toString());
        rt.setExpiresAt(expiresAtString);

        refreshTokenRepository.save(rt);
    }
}
