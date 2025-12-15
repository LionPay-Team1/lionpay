package com.likelion.lionpay_auth.entity;

import com.likelion.lionpay_auth.enums.AdminRole;
import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

/**
 * DynamoDB 단일 테이블의 전체 스키마를 정의하는 마스터 엔티티 클래스입니다.
 * 이 클래스는 테이블 생성 시에만 사용되며, 모든 엔티티의 속성과 GSI를 포함합니다.
 */
@Getter
@Setter
@DynamoDbBean
public class LionPayTableItem extends BaseEntity {

    // User 속성
    private String userId;
    private String phone;
    private String password;
    private String name;
    private String status;
    private String createdAt;
    private String updatedAt;

    // AdminEntity 속성
    private String adminId;
    private String username;
    private String passwordHash;
    private AdminRole role;

    // RefreshTokenEntity 속성
    private String token;
    private String expiresAt;

    // RefreshTokenEntity의 GSI 정의
    @DynamoDbSecondaryPartitionKey(indexNames = "byRefreshToken")
    public String getToken() { return token; }
}