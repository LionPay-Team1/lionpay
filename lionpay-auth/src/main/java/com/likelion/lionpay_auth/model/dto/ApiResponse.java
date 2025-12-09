package com.likelion.lionpay_auth.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * API 응답을 위한 공통 래퍼 클래스.
 * @param data 응답 데이터 (선택적)
 * @param message 응답 메시지 (선택적)
 */
@JsonInclude(JsonInclude.Include.NON_NULL) // null인 필드는 JSON에서 제외
public record ApiResponse<T>(T data, String message) {

    // 데이터만 있는 성공 응답
    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, null);
    }

    // 메시지만 있는 성공 응답
    public static ApiResponse<?> of(String message) {
        return new ApiResponse<>(null, message);
    }
}