package com.likelion.lionpay_auth.dto;

import com.likelion.lionpay_auth.entity.AdminEntity;
import lombok.Builder;

/**
 * 관리자 생성 후 상세 정보를 반환하기 위한 DTO 클래스입니다.
 */
@Builder
public record AdminDetailResponse(
        String adminId,
        String username,
        String name,
        String createdAt
) {
    /**
     * AdminEntity 객체를 AdminDetailResponse DTO로 변환합니다.
     */
    public static AdminDetailResponse from(AdminEntity admin) {
        return AdminDetailResponse.builder()
                .adminId(admin.getAdminId())
                .username(admin.getUsername())
                .name(admin.getName())
                .createdAt(admin.getCreatedAt())
                .build();
    }
}