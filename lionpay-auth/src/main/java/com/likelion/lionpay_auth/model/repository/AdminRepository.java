package com.likelion.lionpay_auth.model.repository;

import com.likelion.lionpay_auth.model.entity.AdminEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import org.springframework.beans.factory.annotation.Value;

import java.util.Optional;

@Repository
public class AdminRepository {

    private final DynamoDbTable<AdminEntity> table;

    /**
     * 제안: 테이블 이름을 application.yml에서 주입받아 사용하면 유연성이 향상됩니다.
     */
    public AdminRepository(DynamoDbEnhancedClient client, @Value("${aws.dynamodb.table.admin}") String tableName) {
        this.table = client.table(tableName,
                TableSchema.fromBean(AdminEntity.class));
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
}
