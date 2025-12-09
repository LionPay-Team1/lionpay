package com.likelion.lionpay_auth.model.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {}
