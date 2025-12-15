package com.likelion.lionpay_auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

import java.time.Instant;
import java.util.UUID;

@Builder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class User extends BaseEntity {

	private String userId;
	private String phone;
	private String password;
	private String name;
	private String status;
	private String createdAt;
	private String updatedAt;

	public void prePersist() {

		// suggestion: 단일 테이블 설계를 위해 PK와 SK를 설정합니다.
		this.setPk(DynamoDBConstants.USER_PREFIX + this.phone);
		this.setSk(DynamoDBConstants.INFO_SK);

		String now = Instant.now().toString();
		if (this.userId == null) {
			this.userId = UUID.randomUUID().toString();
		}
		if (this.createdAt == null) {
			this.createdAt = now;
		}
		if (this.status == null) {
			this.status = "ACTIVE";
		}
		this.updatedAt = now;
	}
}
