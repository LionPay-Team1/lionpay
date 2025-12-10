package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.SignInRequest;
import com.likelion.lionpay_auth.dto.SignInResponse;
import com.likelion.lionpay_auth.dto.SignOutRequest;
import com.likelion.lionpay_auth.dto.SignUpRequest;
import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.service.AuthService;
import com.likelion.lionpay_auth.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PostMapping("/sign-in")
    public ResponseEntity<Map<String, Object>> signIn(@Valid @RequestBody SignInRequest request) {
        log.info("로그인 요청 수신: phone={}", request.getPhone());
        SignInResponse signInResponse = authService.signIn(request);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", signInResponse.getAccessToken());
        response.put("refreshToken", signInResponse.getRefreshToken());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/sign-out")
    public ResponseEntity<Map<String, String>> signOut(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) SignOutRequest request) {

        // Case 1: SignOut via Access Token (Header)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            log.info("로그아웃 요청 수신 (Access Token 기반)");
            authService.signOut(accessToken);
        }
        // Case 2: SignOut via Refresh Token (Body)
        else if (request != null && request.getRefreshToken() != null) {
            log.info("로그아웃 요청 수신 (Refresh Token 기반)");
            authService.signOutByRefreshToken(request.getRefreshToken());
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "로그아웃 되었습니다");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody String refreshToken) {
        log.info("토큰 재발급 요청 수신");
        String cleanToken = refreshToken.replace("\"", "").trim();

        SignInResponse signInResponse = authService.refreshAccessToken(cleanToken);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", signInResponse.getAccessToken());
        response.put("refreshToken", signInResponse.getRefreshToken());

        return ResponseEntity.ok(response);
    }

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
