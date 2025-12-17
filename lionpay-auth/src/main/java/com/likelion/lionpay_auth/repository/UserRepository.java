package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.core.pagination.sync.SdkIterable;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.Page;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final DynamoDbTable<User> userTable;

    /**
     * DynamoDB 페이지네이션 결과를 감싸는 레코드
     * 
     * @param items   현재 페이지의 사용자 목록
     * @param lastKey 다음 페이지 조회를 위한 키 (Base64 인코딩된 문자열)
     * @param hasMore 다음 페이지가 있는지 여부
     */
    public record PaginatedResult<T>(List<T> items, String lastKey, boolean hasMore) {
    }

    public UserRepository(DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.table-name}") String tableName) {
        this.userTable = enhancedClient.table(tableName, TableSchema.fromBean(User.class));
    }

    public User save(User user) {
        userTable.putItem(user);
        return user;
    }

    public Optional<User> findByPhone(String phone) {
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
     * 
     * @return 모든 사용자 목록
     */
    public List<User> findAll() {
        Expression filterExpression = Expression.builder()
                .expression("begins_with(pk, :prefix) AND sk = :sk_info")
                .expressionValues(Map.of(
                        ":prefix", AttributeValue.fromS(DynamoDBConstants.USER_PREFIX),
                        ":sk_info", AttributeValue.fromS(DynamoDBConstants.INFO_SK)))
                .build();

        return userTable.scan(ScanEnhancedRequest.builder().filterExpression(filterExpression).build())
                .items()
                .stream()
                .toList();
    }

    /**
     * DynamoDB 페이지네이션을 사용하여 사용자를 스캔합니다.
     *
     * @param limit   가져올 항목 수
     * @param lastKey 이전 페이지의 마지막 키 (null이면 처음부터 시작)
     * @return 페이지네이션된 결과
     */
    public PaginatedResult<User> findAllPaginated(int limit, String lastKey) {
        Expression filterExpression = Expression.builder()
                .expression("begins_with(pk, :prefix) AND sk = :sk_info")
                .expressionValues(Map.of(
                        ":prefix", AttributeValue.fromS(DynamoDBConstants.USER_PREFIX),
                        ":sk_info", AttributeValue.fromS(DynamoDBConstants.INFO_SK)))
                .build();

        ScanEnhancedRequest.Builder requestBuilder = ScanEnhancedRequest.builder()
                .filterExpression(filterExpression)
                .limit(limit);

        // 이전 페이지의 마지막 키가 있으면 exclusiveStartKey로 설정
        if (lastKey != null && !lastKey.isEmpty()) {
            Map<String, AttributeValue> exclusiveStartKey = decodeLastKey(lastKey);
            if (exclusiveStartKey != null) {
                requestBuilder.exclusiveStartKey(exclusiveStartKey);
            }
        }

        SdkIterable<Page<User>> pages = userTable.scan(requestBuilder.build());

        List<User> items = new ArrayList<>();
        Map<String, AttributeValue> newLastKey = null;

        // 첫 번째 페이지만 가져옴
        for (Page<User> page : pages) {
            items.addAll(page.items());
            newLastKey = page.lastEvaluatedKey();
            break; // 첫 번째 페이지만 처리
        }

        String encodedLastKey = encodeLastKey(newLastKey);
        return new PaginatedResult<>(items, encodedLastKey, newLastKey != null && !newLastKey.isEmpty());
    }

    /**
     * 전체 사용자 수를 반환합니다. (페이지네이션 정보 계산용)
     */
    public long countAll() {
        return findAll().size();
    }

    /**
     * lastEvaluatedKey를 Base64 문자열로 인코딩
     */
    private String encodeLastKey(Map<String, AttributeValue> lastKey) {
        if (lastKey == null || lastKey.isEmpty()) {
            return null;
        }
        // 간단히 pk와 sk만 인코딩 (필요한 경우 더 복잡한 직렬화 사용)
        AttributeValue pk = lastKey.get("pk");
        AttributeValue sk = lastKey.get("sk");
        if (pk != null && sk != null) {
            String combined = pk.s() + "|" + sk.s();
            return Base64.getEncoder().encodeToString(combined.getBytes());
        }
        return null;
    }

    /**
     * Base64 문자열을 lastEvaluatedKey로 디코딩
     */
    private Map<String, AttributeValue> decodeLastKey(String encodedKey) {
        if (encodedKey == null || encodedKey.isEmpty()) {
            return null;
        }
        try {
            String decoded = new String(Base64.getDecoder().decode(encodedKey));
            String[] parts = decoded.split("\\|", 2);
            if (parts.length == 2) {
                Map<String, AttributeValue> key = new HashMap<>();
                key.put("pk", AttributeValue.fromS(parts[0]));
                key.put("sk", AttributeValue.fromS(parts[1]));
                return key;
            }
        } catch (Exception e) {
            // 디코딩 실패 시 null 반환
        }
        return null;
    }
}
