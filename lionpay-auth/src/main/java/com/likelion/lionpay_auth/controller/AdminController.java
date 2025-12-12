package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.*;
import com.likelion.lionpay_auth.security.JwtAuthentication;
import com.likelion.lionpay_auth.service.AdminUserService;
import com.likelion.lionpay_auth.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/sign-out")
	public ResponseEntity<ApiResponse<?>> signOut(
			@AuthenticationPrincipal JwtAuthentication principal,
			@Valid @RequestBody SignOutRequest req) {
		adminAuthService.logout(principal.adminId(), req.getRefreshToken());
		return ResponseEntity.ok(ApiResponse.success("관리자 로그아웃 되었습니다", null));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/new")
	public ResponseEntity<ApiResponse<AdminCreateResponse>> createAdmin(@Valid @RequestBody AdminCreateRequest req) {
		String adminId = adminAuthService.createAdmin(req);
		return ResponseEntity.ok(ApiResponse.success(new AdminCreateResponse(adminId)));
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
