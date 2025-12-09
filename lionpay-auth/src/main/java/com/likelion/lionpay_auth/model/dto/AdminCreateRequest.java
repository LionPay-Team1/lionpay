package com.likelion.lionpay_auth.model.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminCreateRequest(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank String name
) {}
