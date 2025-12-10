package com.likelion.lionpay_auth.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class User {

    private String userId;
    private String phone;
    private String password;
    private String name;
    private String status;
    private String createdAt;
    private String updatedAt;

    // DynamoDB Partition Key - Lombok @Data가 이미 getPhone()을 생성하므로
    // 어노테이션만 추가합니다
    @DynamoDbPartitionKey
    public String getPhone() {
        return phone;
    }

    // Lombok이 생성하는 setPhone()과 일치하도록 수동 정의 제거
    // (또는 명시적으로 다시 작성)
    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void prePersist() {
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