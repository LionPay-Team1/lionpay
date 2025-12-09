package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.model.dto.*;
import com.likelion.lionpay_auth.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/sign-in")
    public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody AdminSignInRequest req) {
        return ResponseEntity.ok(adminAuthService.signIn(req));
    }

    /**
     * 제안: Map.of() 대신 명확한 응답 DTO를 사용하면 API의 일관성과 가독성이 향상됩니다.
     * 또한, @Valid 어노테이션을 추가하여 로그아웃 요청도 검증하는 것이 안전합니다.
     */
    @PostMapping("/sign-out")
    public ResponseEntity<ApiResponse<?>> signOut(
            @AuthenticationPrincipal JwtAuthentication principal,
            @Valid @RequestBody LogoutRequest req
    ) {
        adminAuthService.logout(principal.adminId(), req.refreshToken());
        return ResponseEntity.ok(ApiResponse.of("관리자 로그아웃 되었습니다"));
    }

    @PostMapping("/new")
    public ResponseEntity<ApiResponse<AdminCreateResponse>> createAdmin(@Valid @RequestBody AdminCreateRequest req) {
        String adminId = adminAuthService.createAdmin(req);
        return ResponseEntity.ok(ApiResponse.of(new AdminCreateResponse(adminId)));
    }

    // 유저 검색 API는 user 서비스나 RDB쪽이랑 어떻게 연동할지에 따라 별도 설계
}
