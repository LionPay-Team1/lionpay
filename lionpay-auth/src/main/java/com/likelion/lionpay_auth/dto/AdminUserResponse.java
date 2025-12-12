package com.likelion.lionpay_auth.dto;

import com.likelion.lionpay_auth.entity.User;

/**
 * suggestion: 이 클래스는 Java Record로 대체하여 간결하게 만들 수 있습니다.
 * 관리자가 단일 사용자를 조회할 때의 응답 형식을 정의하는 불변 데이터 객체입니다.
 */
public record AdminUserResponse(
        String userId,
        String phone,
        String status,
        String createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(user.getUserId(), user.getPhone(), user.getStatus(), user.getCreatedAt());
    }
}