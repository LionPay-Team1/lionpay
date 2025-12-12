package com.likelion.lionpay_auth.dto;

import com.likelion.lionpay_auth.entity.User;

/**
 * suggestion: 이 클래스는 Java Record로 대체하여 간결하게 만들 수 있습니다.
 * 사용자 정보 응답을 위한 불변 데이터 객체입니다.
 */
public record UserResponse(
        String userId,
        String phone,
        String status,
        String createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getPhone(),
                user.getStatus(),
                user.getCreatedAt());
    }
}