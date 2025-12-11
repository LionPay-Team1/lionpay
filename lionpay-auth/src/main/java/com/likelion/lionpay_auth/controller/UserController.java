package com.likelion.lionpay_auth.controller;

import com.likelion.lionpay_auth.dto.UserResponse;
import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    /**
     * 현재 로그인된 사용자의 정보를 조회합니다.
     *
     * @param userDetails JWT 토큰에서 파싱된 사용자 정보
     * @return 사용자 정보 DTO
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        log.info("본인 정보 조회 요청: phone={}", user.getPhone());

        return ResponseEntity.ok(UserResponse.from(user));
    }
}