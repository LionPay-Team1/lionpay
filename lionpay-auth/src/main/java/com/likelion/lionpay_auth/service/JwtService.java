package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.config.JwtProperties;
import com.likelion.lionpay_auth.enums.AdminRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final Key signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        // Support both Base64 encoded secret (from JwtUtil) or raw string
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        } catch (IllegalArgumentException e) {
            // Fallback if not base64
            keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // User Access Token
    public String generateAccessToken(String phone) {
        return generateToken(phone, Map.of(), jwtProperties.getUserAudience(),
                jwtProperties.getAccessTokenExpirationMinutes(), ChronoUnit.MINUTES);
    }

    // Admin Access Token
    public String generateAccessToken(String adminId, String username, AdminRole role) {
        return generateToken(adminId, Map.of("username", username, "role", role.name()),
                jwtProperties.getAdminAudience(),
                jwtProperties.getAccessTokenExpirationMinutes(), ChronoUnit.MINUTES);
    }

    // Refresh Token
    public String generateRefreshToken(String subject) {
        // Refresh token can share user audience or have its own. Using user audience as
        // default.
        return generateToken(subject, Map.of(), jwtProperties.getUserAudience(),
                jwtProperties.getRefreshTokenExpirationDays(), ChronoUnit.DAYS);
    }

    private String generateToken(String subject, Map<String, Object> claims, String audience, long duration,
            ChronoUnit unit) {
        Instant now = Instant.now();
        Instant expiration = now.plus(duration, unit);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuer(jwtProperties.getIssuer())
                .setAudience(audience)
                .addClaims(claims)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getSubject(String token) {
        return parseToken(token).getSubject();
    }

    // Alias for code compatibility
    public String getPhoneFromToken(String token) {
        return getSubject(token);
    }

    // Alias for code compatibility
    public String getAdminId(String token) {
        return getSubject(token);
    }

    public String getUsername(String token) {
        return parseToken(token).get("username", String.class);
    }

    public String getRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public Date getExpirationFromToken(String token) {
        return parseToken(token).getExpiration();
    }

    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
