package com.likelion.lionpay_auth.model.repository;

import com.likelion.lionpay_auth.model.entity.AdminEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;

@Repository
public class AdminRepository {

    private final DynamoDbTable<AdminEntity> table;

    public AdminRepository(DynamoDbEnhancedClient client) {
        this.table = client.table("lionpay-admin",
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

