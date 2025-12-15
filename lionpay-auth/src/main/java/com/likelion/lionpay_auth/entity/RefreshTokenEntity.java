package com.likelion.lionpay_auth.entity;

import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@Getter
@Setter
@DynamoDbBean
public class RefreshTokenEntity extends BaseEntity {

	private String userId; // adminId or userId
	private String token; // 실제 토큰 값은 별도 속성으로 저장
	private String createdAt;
	private String expiresAt; // Unix timestamp string

	@DynamoDbSecondaryPartitionKey(indexNames = "byRefreshToken")
	public String getToken() { return token; }
}
