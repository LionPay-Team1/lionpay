package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import com.likelion.lionpay_auth.enums.AdminRole;
import com.likelion.lionpay_auth.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!test")
public class AdminInitializer {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${super-admin.username}")
    private String username;

    @Value("${super-admin.password}")
    private String password;

    /**
     * suggestion: @PostConstruct 대신 DynamoDbInitializer에서 직접 호출하여 실행 순서를 명확히 보장합니다.
     */
    public void initializeSuperAdmin() {
        try {
            if (adminRepository.existsByRole(AdminRole.SUPER_ADMIN)) {
                log.info("SUPER_ADMIN 계정이 이미 존재합니다.");
                return;
            }

            log.info("SUPER_ADMIN 계정을 생성합니다...");
            AdminEntity admin = new AdminEntity();
            admin.setPk(DynamoDBConstants.ADMIN_PREFIX + username);
            admin.setSk(DynamoDBConstants.INFO_SK);
            admin.setAdminId(UUID.randomUUID().toString());
            admin.setUsername(username);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setName("Super Admin");
            admin.setRole(AdminRole.SUPER_ADMIN);
            admin.setCreatedAt(Instant.now().toString());

            adminRepository.save(admin);
            log.info("SUPER_ADMIN 계정 생성이 완료되었습니다.");
        } catch (Exception e) {
            log.error("SUPER_ADMIN 계정 초기화 중 오류가 발생했습니다. (DynamoDB 연결 실패 등): {}", e.getMessage());
        }
    }
}