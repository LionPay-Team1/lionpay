package com.likelion.lionpay_auth.auth.controller;

import com.likelion.lionpay_auth.auth.dto.LoginRequest;
import com.likelion.lionpay_auth.auth.dto.LoginResponse;
import com.likelion.lionpay_auth.auth.dto.LogoutRequest;
import com.likelion.lionpay_auth.auth.dto.SignUpRequest;
import com.likelion.lionpay_auth.auth.entity.User;
import com.likelion.lionpay_auth.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.likelion.lionpay_auth.auth.security.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ GET ping 테스트 API
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/sign-up")
    public ResponseEntity<Map<String, Object>> signUp(@Valid @RequestBody SignUpRequest request) {
        log.info("회원가입 요청 수신: {}", request);
        User user = authService.signUp(request);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", "AccessToken");
        response.put("refreshToken", "RefreshToken");

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 로그인 API (API 명세서: /sign-in)
     */
    @PostMapping("/sign-in")
    public ResponseEntity<Map<String, Object>> signIn(@Valid @RequestBody LoginRequest request) {
        log.info("로그인 요청 수신: phone={}", request.getPhone());
        LoginResponse loginResponse = authService.login(request);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", loginResponse.getAccessToken());
        response.put("refreshToken", loginResponse.getRefreshToken());

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인 API (대체 경로: /login)
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("로그인 요청 수신 (대체경로): phone={}", request.getPhone());
        LoginResponse response = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 로그아웃 API (API 명세서: /sign-out)
     */
    @PostMapping("/sign-out")
    public ResponseEntity<Map<String, String>> signOut(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            log.info("로그아웃 요청 수신: accessToken 일부={}",
                    accessToken.substring(0, Math.min(10, accessToken.length())) + "...");
            authService.logout(accessToken);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "로그아웃 되었습니다");

        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃 API (대체 경로: /logout)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        log.info("로그아웃 요청 수신 (대체경로): refreshToken 일부={}",
                request.getRefreshToken().substring(0, Math.min(10, request.getRefreshToken().length())) + "...");
        authService.logout(request.getRefreshToken());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /**
     * 토큰 재발급 API
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody String refreshToken) {
        log.info("토큰 재발급 요청 수신");
        String cleanToken = refreshToken.replace("\"", "").trim();

        LoginResponse loginResponse = authService.refreshAccessToken(cleanToken);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", loginResponse.getAccessToken());
        response.put("refreshToken", loginResponse.getRefreshToken());

        return ResponseEntity.ok(response);
    }

    /**
     * 본인 유저 정보 조회 API
     */
    @GetMapping("/users/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("본인 정보 조회 요청: phone={}", userDetails.getUser().getPhone());
        User user = userDetails.getUser();

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("phone", user.getPhone());
        response.put("status", user.getStatus());
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }
}