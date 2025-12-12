package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.Map;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final DynamoDbTable<User> userTable;

    public UserRepository(DynamoDbEnhancedClient enhancedClient) {
        this.userTable = enhancedClient.table("User", TableSchema.fromBean(User.class));
    }

    public User save(User user) {
        userTable.putItem(user);
        return user;
    }

    public Optional<User> findByPhone(String phone) {
        // User 테이블은 phone을 파티션 키로만 사용하므로, 정렬 키 없이 조회해야 합니다.
        Key key = Key.builder().partitionValue(phone).build();
        return Optional.ofNullable(userTable.getItem(key));
    }

    public boolean existsByPhone(String phone) {
        return findByPhone(phone).isPresent();
    }

    /**
     * userId로 사용자를 조회합니다. 이 작업은 테이블 전체를 스캔하므로 비용이 많이 들 수 있습니다.
     *
     * @param userId 조회할 사용자의 UUID
     * @return Optional<User>
     */
    public Optional<User> findByUserId(String userId) {
        // filterExpression은 Expression 객체를 직접 생성하여 전달해야 합니다.
        Expression filterExpression = Expression.builder()
                .expression("userId = :val")
                .expressionValues(Map.of(":val", AttributeValue.fromS(userId)))
                .build();

        ScanEnhancedRequest request = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .limit(1)
                .build();

        return userTable.scan(request).items().stream().findFirst();
    }

    /**
     * 모든 사용자를 스캔하여 반환합니다.
     * @return 모든 사용자 목록
     */
    public List<User> findAll() {
        return userTable.scan().items().stream().toList();
    }
}
