package com.likelion.lionpay_auth.entity;

/**
 * DynamoDB 키 접두사 및 고정 값을 관리하는 상수 클래스입니다.
 */
public final class DynamoDBConstants {
    private DynamoDBConstants() {}

    public static final String USER_PREFIX = "USER#";
    public static final String ADMIN_PREFIX = "ADMIN#";
    public static final String INFO_SK = "INFO";
    public static final String REFRESH_TOKEN_SK = "REFRESH_TOKEN";
}