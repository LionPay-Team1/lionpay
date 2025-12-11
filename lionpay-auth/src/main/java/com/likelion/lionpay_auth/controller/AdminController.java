package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.*;
import com.likelion.lionpay_auth.security.JwtAuthentication;
import com.likelion.lionpay_auth.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/sign-in")
    public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody AdminSignInRequest req) {
        return ResponseEntity.ok(adminAuthService.signIn(req));
    }

    @PostMapping("/sign-out")
    public ResponseEntity<ApiResponse<?>> signOut(
            @AuthenticationPrincipal JwtAuthentication principal,
            @Valid @RequestBody SignOutRequest req) {
        adminAuthService.logout(principal.adminId(), req.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("관리자 로그아웃 되었습니다", null));
    }

    @PostMapping("/new")
    public ResponseEntity<ApiResponse<AdminCreateResponse>> createAdmin(@Valid @RequestBody AdminCreateRequest req) {
        String adminId = adminAuthService.createAdmin(req);
        return ResponseEntity.ok(ApiResponse.success(new AdminCreateResponse(adminId)));
    }
}
