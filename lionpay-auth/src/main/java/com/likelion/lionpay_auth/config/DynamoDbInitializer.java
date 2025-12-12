package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.entity.RefreshTokenEntity;
import com.likelion.lionpay_auth.entity.User; // User 엔티티 import 확인
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.model.ResourceInUseException;

/**
 * 애플리케이션 시작 시 DynamoDB 테이블을 자동으로 생성하는 초기화 컴포넌트.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DynamoDbInitializer {

    private final DynamoDbEnhancedClient enhancedClient;

    /**
     * @PostConstruct를 사용하여 이 Bean이 생성된 직후에 테이블 생성 로직이 실행되도록 합니다.
     */
    @PostConstruct
    public void initializeTables() {
        log.info("DynamoDB 테이블 초기화를 시작합니다...");

        // User, Admin, RefreshToken 엔티티에 대한 테이블 스키마를 기반으로 테이블 생성
        createTable(User.class, "lionpay-auth-user");
        createTable(AdminEntity.class, "lionpay-auth-admin");
        createTable(RefreshTokenEntity.class, "lionpay-refresh-token");

        log.info("DynamoDB 테이블 초기화가 완료되었습니다.");
    }

    /**
     * 제네릭 메서드를 사용하여 테이블 생성 로직을 공통화합니다.
     * @param beanClass 테이블 스키마를 정의하는 엔티티 클래스
     * @param tableName 생성할 DynamoDB 테이블 이름
     * @param <T> 엔티티 타입
     */
    private <T> void createTable(Class<T> beanClass, String tableName) {
        DynamoDbTable<T> table = enhancedClient.table(tableName, TableSchema.fromBean(beanClass));
        try {
            table.createTable();
            log.info("'{}' 테이블이 성공적으로 생성되었습니다.", tableName);
        } catch (ResourceInUseException e) {
            // 테이블이 이미 존재하면 예외가 발생하므로, 이를 무시하고 로그를 남깁니다.
            log.info("'{}' 테이블은 이미 존재합니다.", tableName);
        } catch (Exception e) {
            log.error("'{}' 테이블 생성 중 오류가 발생했습니다.", tableName, e);
        }
    }
}
