package com.likelion.lionpay_auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.Instant;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class User {

	private String pk;
	private String sk;
	private String userId;
	private String phone;
	private String password;
	private String name;
	private String status;
	private String createdAt;
	private String updatedAt;

	@DynamoDbPartitionKey
	public String getPk() {
		return pk;
	}

	public void setPk(String pk) {
		this.pk = pk;
	}

	@DynamoDbSortKey
	public String getSk() {
		return sk;
	}

	public void setSk(String sk) {
		this.sk = sk;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}

	public String getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(String updatedAt) {
		this.updatedAt = updatedAt;
	}

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

	@Override
	public String toString() {
		return "User{" +
				"userId='" + userId + '\'' +
				", name='" + name + '\'' +
				", status='" + status + '\'' +
				'}';
	}
}
