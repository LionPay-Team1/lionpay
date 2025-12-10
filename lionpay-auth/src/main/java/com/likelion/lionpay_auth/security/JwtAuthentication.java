package com.likelion.lionpay_auth.security;

/**
 * JWT 토큰에서 추출한 인증 정보를 담는 DTO.
 * 
 * @param adminId  관리자 고유 ID
 * @param username 관리자 사용자명
 */
public record JwtAuthentication(String adminId, String username) {
}
