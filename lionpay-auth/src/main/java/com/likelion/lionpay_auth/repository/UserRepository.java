package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.User;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

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
        Key key = Key.builder()
                .partitionValue(phone)
                .build();
        return Optional.ofNullable(userTable.getItem(key));
    }

    public boolean existsByPhone(String phone) {
        return findByPhone(phone).isPresent();
    }
}
