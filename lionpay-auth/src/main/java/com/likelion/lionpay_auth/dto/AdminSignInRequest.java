package com.likelion.lionpay_auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminSignInRequest(
        @NotBlank String username,
        @NotBlank String password) {
}
