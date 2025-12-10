package com.likelion.lionpay_auth.model.repository;

import com.likelion.lionpay_auth.model.entity.RefreshTokenEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import org.springframework.beans.factory.annotation.Value;

import java.util.Optional;

@Repository
public class RefreshTokenRepository {

    private final DynamoDbTable<RefreshTokenEntity> table;
    private final DynamoDbIndex<RefreshTokenEntity> byRefreshTokenIndex;

    /**
     * 제안: 테이블 이름을 application.yml에서 주입받아 사용하면 유연성이 향상됩니다.
     */
    public RefreshTokenRepository(DynamoDbEnhancedClient client, @Value("${aws.dynamodb.table.refresh-token}") String tableName) {
        this.table = client.table(tableName,
                TableSchema.fromBean(RefreshTokenEntity.class));
        // "byRefreshToken"은 DynamoDB에 생성할 GSI의 이름입니다.
        this.byRefreshTokenIndex = table.index("byRefreshToken");
    }

    public void save(RefreshTokenEntity token) {
        table.putItem(token);
    }

    // [개선] 메서드 이름을 더 범용적인 이름으로 변경합니다.
    public void deleteAllByUserId(String userId) {
        String pk = "REFRESH_TOKEN#" + userId;
        PageIterable<RefreshTokenEntity> pages = table.query(r -> r.queryConditional(
                QueryConditional.keyEqualTo(Key.builder().partitionValue(pk).build())
        ));
        pages.items().forEach(table::deleteItem);
    }

    /**
     * 제안: 로그아웃 로직을 위해 PK와 SK로 특정 토큰을 조회하는 메서드를 추가합니다.
     */
    public Optional<RefreshTokenEntity> findByPkAndSk(String pk, String sk) {
        Key key = Key.builder().partitionValue(pk).sortValue(sk).build();
        return Optional.ofNullable(table.getItem(r -> r.key(key)));
    }

    /**
     * 제안: 특정 엔티티를 삭제하는 메서드를 추가합니다.
     *
     * @param tokenEntity 삭제할 리프레시 토큰 엔티티
     */
    public void delete(RefreshTokenEntity tokenEntity) {
        table.deleteItem(tokenEntity);
    }

    /**
     * 제안: GSI를 사용하여 리프레시 토큰 값으로 엔티티를 조회합니다.
     * @param refreshToken 조회할 리프레시 토큰
     * @return 조회된 토큰 엔티티 (Optional)
     */
    public Optional<RefreshTokenEntity> findByRefreshToken(String refreshToken) {
        QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(refreshToken).build());
        // GSI 쿼리 결과는 여러 개일 수 있으므로 첫 번째 항목을 가져옵니다.
        return byRefreshTokenIndex.query(query).stream().findFirst().flatMap(page -> page.items().stream().findFirst());
    }
}
