package com.likelion.lionpay_auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.io.Decoders;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration-minutes}")
    private long accessTokenMinutes;

    private SecretKey key;

    /**
     * suggestion: @PostConstruct를 사용하여 애플리케이션 시작 시점에 Key 객체를 한 번만 생성합니다.
     * 이렇게 하면 토큰을 생성할 때마다 Key를 만드는 비효율을 줄일 수 있습니다.
     */
    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String adminId, String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenMinutes * 60_000);

        return Jwts.builder()
                .setSubject(adminId)
                .claim("username", username)
                .claim("role", "ADMIN")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            // 만료, 변조 등 모든 예외 발생 시 false 반환
            return false;
        }
    }

    // 토큰에서 adminId (subject) 추출
    public String getAdminId(String token) {
        return parseToken(token).getSubject();
    }

    // 토큰에서 username 추출
    public String getUsername(String token) {
        return parseToken(token).get("username", String.class);
    }

    // 토큰 파싱을 위한 private 헬퍼 메서드
    private Claims parseToken(String token) {
        // suggestion: 만료된 토큰의 클레임을 반환하는 것은 보안상 위험할 수 있습니다.
        // 예외를 그대로 던져 호출자가 처리하도록 하는 것이 더 안전합니다.
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
