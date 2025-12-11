package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.enums.AdminRole;
import com.likelion.lionpay_auth.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.DependsOn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@DependsOn("dynamoDbInitializer") // suggestion: DynamoDbInitializer가 먼저 실행되도록 의존성을 설정합니다.
public class AdminInitializer {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${super-admin.username}")
    private String username;

    @Value("${super-admin.password}")
    private String password;

    @PostConstruct
    public void init() {
        if (adminRepository.existsByRole(AdminRole.SUPER_ADMIN)) {
            log.info("SUPER_ADMIN 계정이 이미 존재합니다.");
            return;
        }

        log.info("SUPER_ADMIN 계정을 생성합니다...");
        AdminEntity admin = new AdminEntity();
        admin.setPk("ADMIN#" + username);
        admin.setSk("INFO");
        admin.setAdminId(UUID.randomUUID().toString());
        admin.setUsername(username);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setName("Super Admin");
        admin.setRole(AdminRole.SUPER_ADMIN);
        admin.setCreatedAt(Instant.now().toString());

        adminRepository.save(admin);
        log.info("SUPER_ADMIN 계정 생성이 완료되었습니다.");
    }
}