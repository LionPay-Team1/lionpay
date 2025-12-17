package com.likelion.lionpay_auth.dto;

import com.likelion.lionpay_auth.enums.AdminRole;

/**
 * 관리자 정보 업데이트 요청 DTO
 * password와 role은 선택적 필드입니다.
 */
public record AdminUpdateRequest(
        String name,
        String password,
        AdminRole role) {
}
