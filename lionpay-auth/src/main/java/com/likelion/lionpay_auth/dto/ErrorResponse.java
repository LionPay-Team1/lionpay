package com.likelion.lionpay_auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.util.Map;

/**
 * API 에러 응답을 위한 공통 DTO 클래스입니다.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL) // suggestion: null인 필드는 JSON 응답에 포함되지 않도록 설정하여 응답 본문을 깔끔하게 유지합니다.
public class ErrorResponse {

    private final String errorCode;
    private final String message;
    private final Map<String, String> errors; // 유효성 검사 에러 상세 내용

    /**
     * 일반적인 에러 응답을 위한 생성자입니다.
     * @param errorCode 에러 코드
     * @param message 에러 메시지
     */
    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
        this.errors = null;
    }

    /**
     * 유효성 검사 에러 응답을 위한 생성자입니다.
     */
    public ErrorResponse(String errorCode, String message, Map<String, String> errors) {
        this.errorCode = errorCode;
        this.message = message;
        this.errors = errors;
    }
}