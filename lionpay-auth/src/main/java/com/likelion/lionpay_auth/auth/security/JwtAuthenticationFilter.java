package com.likelion.lionpay_auth.auth.security;

import com.likelion.lionpay_auth.auth.entity.User;
import com.likelion.lionpay_auth.auth.repository.UserRepository;
import com.likelion.lionpay_auth.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        log.debug("=== JWT Filter 실행 ===");
        log.debug("요청 URI: {}", requestURI);
        log.debug("Authorization Header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("토큰 없음 - 필터 통과");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        log.debug("추출된 토큰 (앞 30자): {}...", token.substring(0, Math.min(30, token.length())));

        try {
            boolean isValid = jwtService.validateToken(token);
            log.debug("토큰 검증 결과: {}", isValid);

            if (isValid) {
                String phone = jwtService.getPhoneFromToken(token);
                log.debug("토큰에서 추출한 phone: {}", phone);

                User user = userRepository.findByPhone(phone).orElse(null);

                if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    log.debug("사용자 찾음: phone={}, userId={}", user.getPhone(), user.getUserId());

                    CustomUserDetails userDetails = new CustomUserDetails(user);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("인증 설정 완료!");
                } else if (user == null) {
                    log.warn("사용자를 찾을 수 없음: phone={}", phone);
                } else {
                    log.debug("이미 인증된 사용자");
                }
            } else {
                log.warn("토큰 검증 실패");
            }
        } catch (Exception e) {
            log.error("JWT 인증 실패: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}