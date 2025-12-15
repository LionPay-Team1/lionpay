package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import com.likelion.lionpay_auth.entity.RefreshTokenEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.Optional;

@Repository
public class RefreshTokenRepository {

	private final DynamoDbTable<RefreshTokenEntity> table;
	private final DynamoDbIndex<RefreshTokenEntity> byRefreshTokenIndex;

	public RefreshTokenRepository(DynamoDbEnhancedClient client,
								  @Value("${aws.dynamodb.table-name}") String tableName) {
		// 1. 실제 데이터 매핑은 RefreshTokenEntity 클래스를 기준으로 테이블 객체를 생성합니다.
		DynamoDbTable<RefreshTokenEntity> refreshTokenTable = client.table(tableName, TableSchema.fromBean(RefreshTokenEntity.class));
		this.table = refreshTokenTable;
		this.byRefreshTokenIndex = refreshTokenTable.index("byRefreshToken");
	}

	public void save(RefreshTokenEntity token) {
		table.putItem(token);
	}

	public void deleteAllByUserId(String userId) {
		// suggestion: AuthService에서 저장한 PK 형식과 일치하도록 DynamoDBConstants를 사용합니다.
		String pk = DynamoDBConstants.USER_PREFIX + userId;
		PageIterable<RefreshTokenEntity> pages = table.query(r -> r.queryConditional(
				QueryConditional.keyEqualTo(Key.builder().partitionValue(pk).build())));
		pages.items().forEach(table::deleteItem);
	}

	public Optional<RefreshTokenEntity> findByPkAndSk(String pk, String sk) {
		Key key = Key.builder().partitionValue(pk).sortValue(sk).build();
		return Optional.ofNullable(table.getItem(r -> r.key(key)));
	}

	public void delete(RefreshTokenEntity tokenEntity) {
		table.deleteItem(tokenEntity);
	}

	// Auth Repository compatibility: Delete by specific token string (requires
	// finding it first)
	public void deleteByToken(String token) {
		findByRefreshToken(token).ifPresent(this::delete);
	}

	public Optional<RefreshTokenEntity> findByRefreshToken(String refreshToken) {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(refreshToken).build());
		return byRefreshTokenIndex.query(query).stream()
				.findFirst()
				.flatMap(page -> page.items().stream().findFirst());
	}
}
