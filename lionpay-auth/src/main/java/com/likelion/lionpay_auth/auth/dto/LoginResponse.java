package com.likelion.lionpay_auth.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default; // @Builder.Default 사용을 위한 Import

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;

    // @Builder.Default를 추가하여, 빌더를 사용할 때 기본값 "Bearer"가 적용되도록 수정했습니다.
    @Default
    private String tokenType = "Bearer";

    private String phone;
    private String name;
}