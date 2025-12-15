package com.likelion.lionpay_auth.entity;

import com.likelion.lionpay_auth.enums.AdminRole;
import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

@Getter
@Setter
@DynamoDbBean
public class AdminEntity extends BaseEntity {

    private String adminId;
    private String username;
    private String passwordHash;
    private String name;
    private String createdAt;
    private AdminRole role;
}
