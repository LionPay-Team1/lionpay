package com.likelion.lionpay_auth.security;

import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.repository.UserRepository;
import com.likelion.lionpay_auth.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j // suggestion: 로그를 사용하기 위해 @Slf4j 어노테이션을 추가합니다.
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtService.validateToken(token)) {
                // Determine if Admin or User based on extracted claims (or lack thereof)
                // Note: JwtService.validateToken parses parsing internally, but we might parse
                // again here
                // Optimization: JwtService could return claims, but let's stick to using helper
                // methods.

                String username = jwtService.getUsername(token); // Returns null if not present

                if (username != null) {
                    // It's an ADMIN token
                    String adminId = jwtService.getSubject(token);
                    String role = jwtService.getRole(token);
                    String authority = "ROLE_" + role;

                    JwtAuthentication principal = new JwtAuthentication(adminId, username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal, null, List.of(() -> authority));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                } else {
                    // It's a USER token
                    String phone = jwtService.getSubject(token);
                    User user = userRepository.findByPhone(phone).orElse(null);

                    if (user != null) {
                        CustomUserDetails userDetails = new CustomUserDetails(user);
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            log.error("JWT Authentication failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
