package com.likelion.lionpay_auth.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken) {
}
