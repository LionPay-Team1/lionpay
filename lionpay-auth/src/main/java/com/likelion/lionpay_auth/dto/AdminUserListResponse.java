package com.likelion.lionpay_auth.dto;

import java.util.List;

/**
 * 관리자가 사용자 목록을 조회할 때의 페이징된 응답 형식을 정의합니다.
 * DynamoDB 스캔 페이지네이션을 지원하기 위해 lastKey 필드를 포함합니다.
 */
public record AdminUserListResponse(
                int page,
                int size,
                long totalCount,
                int totalPages,
                String lastKey,
                List<AdminUserResponse> users) {
        /**
         * totalCount와 size를 사용하여 totalPages를 계산하는 팩토리 메서드
         */
        public static AdminUserListResponse of(int page, int size, long totalCount, String lastKey,
                        List<AdminUserResponse> users) {
                int totalPages = (int) Math.ceil((double) totalCount / size);
                return new AdminUserListResponse(page, size, totalCount, totalPages, lastKey, users);
        }
}
