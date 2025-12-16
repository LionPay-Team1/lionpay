package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.*;
import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.security.JwtAuthentication;
import com.likelion.lionpay_auth.service.AdminUserService;
import com.likelion.lionpay_auth.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final AdminUserService adminUserService;

    @PostMapping("/sign-in")
    public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody AdminSignInRequest req) {
        return ResponseEntity.ok(adminAuthService.signIn(req));
    }

    @PostMapping("/sign-out")
    public ResponseEntity<Void> signOut(
            @AuthenticationPrincipal JwtAuthentication principal,
            @Valid @RequestBody SignOutRequest req) {
        adminAuthService.logout(principal.adminId(), req.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    // suggestion: API 응답 형식을 요청사항에 맞게 상세 정보 DTO로 직접 반환하도록 수정합니다.
    @PostMapping("/new")
    public ResponseEntity<AdminDetailResponse> createAdmin(@Valid @RequestBody AdminCreateRequest req) {
        AdminEntity createdAdmin = adminAuthService.createAdmin(req);
        return ResponseEntity.ok(AdminDetailResponse.from(createdAdmin));
    }

    // suggestion: 관리자 전용 토큰 재발급 엔드포인트를 추가합니다.
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshAdminToken(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(adminAuthService.refreshAdminToken(req.getRefreshToken()));
    }

    /**
     * 관리자가 사용자를 조회하는 API입니다.
     * phone 또는 userId로 단일 조회하거나, 파라미터가 없으면 전체 목록을 페이징하여 조회합니다.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (phone != null || userId != null) {
            // 단일 사용자 조회
            AdminUserResponse userResponse = adminUserService.findUser(phone, userId);
            return ResponseEntity.ok(userResponse);
        } else {
            // 전체 사용자 목록 조회 (페이징)
            AdminUserListResponse userListResponse = adminUserService.findAllUsers(page, size);
            return ResponseEntity.ok(userListResponse);
        }
    }
}
