package com.likelion.lionpay_auth.entity;

import com.likelion.lionpay_auth.enums.AdminRole;
import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@Data
@DynamoDbBean
public class AdminEntity {

    private String pk; // "ADMIN#{username}"
    private String sk; // "INFO"
    private String adminId;
    private String username;
    private String passwordHash;
    private String name;
    private String createdAt;
    private AdminRole role;

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

    public AdminRole getRole() {
        return role;
    }
    public void setRole(AdminRole role) {
        this.role = role;
    }
}
