package com.likelion.lionpay_auth.auth.repository;

import com.likelion.lionpay_auth.auth.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;

@Slf4j
@Repository
public class UserRepository {

    private final DynamoDbTable<User> userTable;

    public UserRepository(DynamoDbEnhancedClient enhancedClient) {
        log.info("UserRepository 초기화 중...");
        this.userTable = enhancedClient.table("Users", TableSchema.fromBean(User.class));
        log.info("Users 테이블 스키마 로딩 완료");
    }

    /** 사용자 저장 */
    public User save(User user) {
        log.info("사용자 저장 시도: phone={}", user.getPhone());
        user.prePersist();

        try {
            userTable.putItem(user);
            log.info("사용자 저장 성공: phone={}, userId={}", user.getPhone(), user.getUserId());
            return user;
        } catch (Exception e) {
            log.error("❌ DynamoDB 저장 실패: {}", e.getMessage(), e);
            throw e; // 예외 숨기지 말고 그대로 전파
        }
    }

    /** phone(PK) 로 조회 */
    public Optional<User> findByPhone(String phone) {
        log.info("사용자 조회 시도: phone={}", phone);

        Key key = Key.builder()
                .partitionValue(phone)
                .build();

        try {
            User user = userTable.getItem(key);
            if (user != null) {
                log.info("사용자 조회 성공: phone={}", phone);
            } else {
                log.info("사용자 없음: phone={}", phone);
            }
            return Optional.ofNullable(user);
        } catch (Exception e) {
            log.error("❌ 사용자 조회 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    /** 존재 여부 */
    public boolean existsByPhone(String phone) {
        return findByPhone(phone).isPresent();
    }

    /** 사용자 삭제 */
    public void delete(String phone) {
        log.info("사용자 삭제 시도: phone={}", phone);

        Key key = Key.builder()
                .partitionValue(phone)
                .build();

        try {
            userTable.deleteItem(key);
            log.info("사용자 삭제 완료: phone={}", phone);
        } catch (Exception e) {
            log.error("❌ 사용자 삭제 실패: {}", e.getMessage(), e);
            throw e;
        }
    }
}
