package com.likelion.lionpay_auth.dto;

import java.util.List;

/**
 * suggestion: 이 클래스는 Java Record로 대체하여 간결하게 만들 수 있습니다.
 * 관리자가 사용자 목록을 조회할 때의 페이징된 응답 형식을 정의하는 불변 데이터 객체입니다.
 */
public record AdminUserListResponse(
        int page,
        int size,
        long totalCount,
        List<AdminUserResponse> users
) {}