package com.likelion.lionpay_auth.model.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminSignInRequest(
        @NotBlank String username,
        @NotBlank String password
) {}
