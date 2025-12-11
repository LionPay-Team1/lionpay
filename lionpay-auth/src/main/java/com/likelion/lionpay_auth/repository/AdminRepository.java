package com.likelion.lionpay_auth.repository;

import com.likelion.lionpay_auth.entity.AdminEntity;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.Optional;

@Repository
public class AdminRepository {

	private final DynamoDbTable<AdminEntity> table;

	public AdminRepository(DynamoDbEnhancedClient client) {
		this.table = client.table("lionpay-auth-admin", TableSchema.fromBean(AdminEntity.class));
	}

	public void save(AdminEntity admin) {
		table.putItem(admin);
	}

	public Optional<AdminEntity> findByUsername(String username) {
		Key key = Key.builder()
				.partitionValue("ADMIN#" + username)
				.build();

		// GSI가 아니라 PK 설계를 "ADMIN#{username}"으로 했으므로 getItem 가능
		// 하지만 SK가 "INFO"로 고정되어 있음.
		// getItem을 하려면 SK도 필요함.
		return Optional.ofNullable(table.getItem(
				Key.builder()
						.partitionValue("ADMIN#" + username)
						.sortValue("INFO")
						.build()));
	}

	public Optional<AdminEntity> findByAdminId(String adminId) {
		// adminId로 찾으려면 GSI가 필요하거나 Scan을 해야 함.
		// 현재 스키마상 adminId는 속성일 뿐임.
		// TODO: GSI 추가 고려 or Scan (현재는 Scan으로 구현)
		return table.scan().items().stream()
				.filter(a -> adminId.equals(a.getAdminId()))
				.findFirst();
	}
}
