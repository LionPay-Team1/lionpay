package com.likelion.lionpay_auth.auth.repository;

import com.likelion.lionpay_auth.auth.entity.RefreshToken;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.Optional;

@Repository
public class RefreshTokenRepository {

    private final DynamoDbTable<RefreshToken> refreshTokenTable;

    public RefreshTokenRepository(DynamoDbEnhancedClient enhancedClient) {
        this.refreshTokenTable = enhancedClient.table("RefreshTokens",
                TableSchema.fromBean(RefreshToken.class));
    }

    public RefreshToken save(RefreshToken refreshToken) {
        refreshTokenTable.putItem(refreshToken);
        return refreshToken;
    }

    public Optional<RefreshToken> findByToken(String token) {
        Key key = Key.builder()
                .partitionValue(token)
                .build();
        RefreshToken refreshToken = refreshTokenTable.getItem(key);
        return Optional.ofNullable(refreshToken);
    }

    // findById 추가 (findByToken과 동일)
    public Optional<RefreshToken> findById(String token) {
        return findByToken(token);
    }

    public void delete(String token) {
        Key key = Key.builder()
                .partitionValue(token)
                .build();
        refreshTokenTable.deleteItem(key);
    }
}