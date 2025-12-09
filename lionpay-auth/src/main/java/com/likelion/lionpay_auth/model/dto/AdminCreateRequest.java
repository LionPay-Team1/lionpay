package com.likelion.lionpay_auth.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminCreateRequest(
        @NotBlank String username,
        @NotBlank
        @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:;<>.,?]).{8,}$",
            message = "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character."
        ) String password,
        @NotBlank String name
) {}
