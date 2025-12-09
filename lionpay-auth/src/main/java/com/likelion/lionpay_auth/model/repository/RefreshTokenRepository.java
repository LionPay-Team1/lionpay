package com.likelion.lionpay_auth.model.repository;

import com.likelion.lionpay_auth.model.entity.RefreshTokenEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

@Repository
public class RefreshTokenRepository {

    private final DynamoDbTable<RefreshTokenEntity> table;

    public RefreshTokenRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("lionpay-refresh-token",
                TableSchema.fromBean(RefreshTokenEntity.class));
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
}
