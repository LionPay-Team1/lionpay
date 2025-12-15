package com.likelion.lionpay_auth.config;

import com.likelion.lionpay_auth.entity.LionPayTableItem;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.dynamodb.model.ResourceInUseException;

import org.springframework.beans.factory.ObjectProvider;

/**
 * 애플리케이션 시작 시 DynamoDB 단일 테이블을 자동으로 생성하는 초기화 컴포넌트.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DynamoDbInitializer {

    private final DynamoDbEnhancedClient enhancedClient;
    // suggestion: @Value 어노테이션을 필드에 직접 사용하여 생성자 코드를 단순화합니다.
    @Value("${aws.dynamodb.table-name}")
    private String tableName;
    private final ObjectProvider<AdminInitializer> adminInitializerProvider; // Optional dependency

    @PostConstruct
    public void initializeTables() {
        log.info("DynamoDB 테이블({}) 초기화를 시작합니다...", tableName);

        // suggestion: 모든 속성과 GSI를 포함하는 마스터 엔티티(LionPayTableItem)를 사용하여 테이블 스키마를 생성합니다.
        // 이렇게 하면 모든 키 구조가 테이블 메타데이터에 올바르게 반영됩니다.
        DynamoDbTable<LionPayTableItem> table = enhancedClient.table(tableName,
                TableSchema.fromBean(LionPayTableItem.class));

        try {
            // 마스터 스키마에 GSI 정보가 모두 포함되어 있으므로,
            // 별도의 설정 없이 createTable()을 호출하면 SDK가 알아서 GSI를 포함하여 테이블을 생성합니다.
            table.createTable();
            log.info("'{}' 테이블이 성공적으로 생성되었습니다.", tableName);
        } catch (ResourceInUseException e) {
            log.info("'{}' 테이블은 이미 존재합니다.", tableName);
        } catch (Exception e) {
            log.error("'{}' 테이블 생성 중 오류가 발생했습니다.", tableName, e);
        }

        adminInitializerProvider.ifAvailable(AdminInitializer::initializeSuperAdmin);
        log.info("DynamoDB 테이블 초기화가 완료되었습니다.");
    }
}
