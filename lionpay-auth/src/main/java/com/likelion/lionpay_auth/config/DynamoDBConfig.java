package com.likelion.lionpay_auth.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.net.URI;

@Slf4j
@Configuration
public class DynamoDBConfig {

	@Bean
	public DynamoDbClient dynamoDbClient(
			@Value("${aws.region}") String region,
			@Value("${aws.dynamodb.endpoint}") String endpoint,
			@Value("${aws.dynamodb.access-key}") String accessKey,
			@Value("${aws.dynamodb.secret-key}") String secretKey) {
		log.info("Creating DynamoDbClient Bean...");
		log.info("Region: {}", region);
		log.info("Endpoint: {}", endpoint);

		return DynamoDbClient.builder()
				.region(Region.of(region))
				.endpointOverride(URI.create(endpoint))
				.credentialsProvider(
						StaticCredentialsProvider.create(
								AwsBasicCredentials.create(accessKey, secretKey)))
				.build();
	}

	@Bean
	public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient client) {
		log.info("Creating DynamoDbEnhancedClient Bean");
		return DynamoDbEnhancedClient.builder()
				.dynamoDbClient(client)
				.build();
	}
}
