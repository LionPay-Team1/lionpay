package com.likelion.lionpay_auth.model.entity;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
public class RefreshTokenEntity {

    // [개선] 유저와 관리자가 공용으로 사용하도록 PK 형식을 통일합니다.
    private String pk;          // "REFRESH_TOKEN#{userId}" (userId는 adminId 또는 실제 userId)
    private String sk;          // refresh token 문자열
    private String userId;      // 토큰의 주인 ID (adminId 또는 실제 userId)
    private String createdAt;
    private String expiresAt;

    @DynamoDbPartitionKey
    public String getPk() { return pk; }
    public void setPk(String pk) { this.pk = pk; }

    @DynamoDbSortKey
    public String getSk() { return sk; }
    public void setSk(String sk) { this.sk = sk; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
