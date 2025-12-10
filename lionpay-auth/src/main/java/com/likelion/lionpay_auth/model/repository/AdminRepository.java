package com.likelion.lionpay_auth.model.repository;

import com.likelion.lionpay_auth.model.entity.AdminEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import org.springframework.beans.factory.annotation.Value;

import java.util.Optional;

@Repository
public class AdminRepository {

    private final DynamoDbTable<AdminEntity> table;
    private final DynamoDbIndex<AdminEntity> byAdminIdIndex;

    /**
     * 제안: 테이블 이름을 application.yml에서 주입받아 사용하면 유연성이 향상됩니다.
     */
    public AdminRepository(DynamoDbEnhancedClient client, @Value("${aws.dynamodb.table.admin}") String tableName) {
        this.table = client.table(tableName,
                TableSchema.fromBean(AdminEntity.class));
        // "byAdminId"는 DynamoDB에 생성할 GSI의 이름입니다.
        this.byAdminIdIndex = table.index("byAdminId");
    }

    public Optional<AdminEntity> findByUsername(String username) {
        Key key = Key.builder()
                .partitionValue("ADMIN#" + username)
                .sortValue("INFO")
                .build();
        AdminEntity entity = table.getItem(r -> r.key(key));
        return Optional.ofNullable(entity);
    }

    public void save(AdminEntity admin) {
        table.putItem(admin);
    }

    /**
     * 제안: GSI를 사용하여 adminId로 관리자 정보를 조회합니다.
     * @param adminId 조회할 관리자 ID
     * @return 조회된 관리자 엔티티 (Optional)
     */
    public Optional<AdminEntity> findByAdminId(String adminId) {
        QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(adminId).build());
        // GSI 쿼리 결과는 여러 개일 수 있으므로 첫 번째 항목을 가져옵니다.
        return byAdminIdIndex.query(query).stream().findFirst().flatMap(page -> page.items().stream().findFirst());
    }
}
