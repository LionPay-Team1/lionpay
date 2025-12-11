package com.likelion.lionpay_auth.entity;

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

    // DynamoDB Partition Key
    @DynamoDbPartitionKey
    public String getPhone() {
        return phone;
    }

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
