package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
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

    // suggestion: 하드코딩된 숫자/문자열을 상수로 추출하세요. 테이블 이름을 설정 파일에서 주입받아 사용하면 유연성이 높아집니다.
    public UserRepository(DynamoDbEnhancedClient enhancedClient,
                          @Value("${aws.dynamodb.table-name}") String tableName) {
        this.userTable = enhancedClient.table(tableName, TableSchema.fromBean(User.class));
    }

    public User save(User user) {
        userTable.putItem(user);
        return user;
    }

    public Optional<User> findByPhone(String phone) {
        // suggestion: 단일 테이블 설계에 맞게 PK와 SK를 사용하여 조회합니다.
        Key key = Key.builder()
                .partitionValue(DynamoDBConstants.USER_PREFIX + phone)
                .sortValue(DynamoDBConstants.INFO_SK)
                .build();
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
        // suggestion: 테이블 전체를 스캔할 때, 사용자 정보만 필터링하도록 filterExpression을 추가합니다.
        // 이렇게 하면 User가 아닌 다른 타입의 데이터(Admin, RefreshToken 등)가 결과에 포함되는 것을 방지할 수 있습니다.
        Expression filterExpression = Expression.builder()
                .expression("begins_with(pk, :prefix) AND sk = :sk_info")
                .expressionValues(Map.of(
                        ":prefix", AttributeValue.fromS(DynamoDBConstants.USER_PREFIX),
                        ":sk_info", AttributeValue.fromS(DynamoDBConstants.INFO_SK)
                ))
                .build();

        return userTable.scan(ScanEnhancedRequest.builder().filterExpression(filterExpression).build())
                .items()
                .stream()
                .toList();
    }
}
