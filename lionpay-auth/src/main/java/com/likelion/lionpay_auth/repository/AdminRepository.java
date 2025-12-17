package com.likelion.lionpay_auth.repository;

import org.springframework.beans.factory.annotation.Value;
import com.likelion.lionpay_auth.entity.DynamoDBConstants;
import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.entity.AdminEntity;
import com.likelion.lionpay_auth.enums.AdminRole;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.Optional;

@Repository
public class AdminRepository {

    private final DynamoDbTable<AdminEntity> adminTable;

    // suggestion: 하드코딩된 숫자/문자열을 상수로 추출하세요. 테이블 이름을 설정 파일에서 주입받아 사용하면 유연성이 높아집니다.
    public AdminRepository(DynamoDbEnhancedClient enhancedClient,
            @Value("${aws.dynamodb.table-name}") String tableName) {
        // suggestion: 단일 테이블의 전체 스키마를 정의하는 User.class를 기준으로 테이블을 인식하도록 수정합니다.
        // 실제 데이터 매핑은 AdminEntity로 이루어지지만, 테이블 구조 인식은 User 클래스를 따릅니다.
        this.adminTable = enhancedClient.table(tableName, TableSchema.fromBean(AdminEntity.class));
    }

    public void save(AdminEntity admin) {
        adminTable.putItem(admin);
    }

    public Optional<AdminEntity> findByUsername(String username) {
        // suggestion: 단일 테이블 설계에 맞게 PK와 SK를 사용하여 조회합니다.
        return Optional.ofNullable(adminTable.getItem(
                Key.builder()
                        .partitionValue(DynamoDBConstants.ADMIN_PREFIX + username)
                        .sortValue(DynamoDBConstants.INFO_SK)
                        .build()));
    }

    public Optional<AdminEntity> findByAdminId(String adminId) {
        // adminId로 찾으려면 GSI가 필요하거나 Scan을 해야 함.
        // 현재 스키마상 adminId는 속성일 뿐임.
        // TODO: GSI 추가 고려 or Scan (현재는 Scan으로 구현)
        return adminTable.scan().items().stream()
                .filter(a -> adminId.equals(a.getAdminId()))
                .findFirst();
    }

    /**
     * 특정 역할을 가진 관리자가 존재하는지 확인합니다.
     * 경고: 이 메서드는 테이블 전체를 스캔하므로 성능에 유의해야 합니다.
     * 
     * @param role 확인할 역할
     * @return 존재 여부
     */
    public boolean existsByRole(AdminRole role) {
        return adminTable.scan().items().stream().anyMatch(admin -> role.equals(admin.getRole()));
    }

    /**
     * 모든 관리자 목록을 조회합니다.
     * 경고: 이 메서드는 테이블 전체를 스캔하므로 성능에 유의해야 합니다.
     * 
     * @return 관리자 목록
     */
    public java.util.List<AdminEntity> findAll() {
        return adminTable.scan().items().stream()
                .filter(item -> item.getPk() != null && item.getPk().startsWith(DynamoDBConstants.ADMIN_PREFIX))
                .collect(java.util.stream.Collectors.toList());
    }
}
