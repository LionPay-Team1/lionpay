package com.likelion.lionpay_auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.net.URI;

/**
 * DynamoDB 클라이언트를 설정하고 Bean으로 등록하는 클래스.
 */
@Configuration
public class DynamoDbConfig {

    @Value("${aws.dynamodb.endpoint:}")
    private String endpoint;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.dynamodb.access-key:}")
    private String accessKey;

    @Value("${aws.dynamodb.secret-key:}")
    private String secretKey;

    @Bean
    public DynamoDbClient dynamoDbClient() {
        var builder = DynamoDbClient.builder()
                .region(Region.of(region));

        // endpoint가 설정된 경우 (로컬 DynamoDB) 정적 자격 증명 사용
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)));
        } else {
            // AWS 실제 DynamoDB 사용 시 기본 자격 증명 체인 (프로필 포함)
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }

    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}
