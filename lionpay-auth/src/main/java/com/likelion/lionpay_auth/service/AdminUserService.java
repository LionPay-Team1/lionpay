package com.likelion.lionpay_auth.service;

import com.likelion.lionpay_auth.dto.AdminUserListResponse;
import com.likelion.lionpay_auth.dto.AdminUserResponse;
import com.likelion.lionpay_auth.entity.User;
import com.likelion.lionpay_auth.exception.UserNotFoundException;
import com.likelion.lionpay_auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    /**
     * 전화번호 또는 userId로 단일 사용자를 조회합니다.
     *
     * @param phone  사용자 전화번호 (선택)
     * @param userId 사용자 UUID (선택)
     * @return 조회된 사용자 정보
     */
    public AdminUserResponse findUser(String phone, String userId) {
        User user;
        if (phone != null) {
            user = userRepository.findByPhone(phone)
                    .orElseThrow(() -> new UserNotFoundException("해당 전화번호의 사용자를 찾을 수 없습니다."));
        } else if (userId != null) {
            user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new UserNotFoundException("해당 ID의 사용자를 찾을 수 없습니다."));
        } else {
            throw new IllegalArgumentException("조회하려면 phone 또는 userId 중 하나가 필요합니다.");
        }
        return AdminUserResponse.from(user);
    }

    /**
     * 모든 사용자를 조회하고 페이징을 적용합니다.
     * 프론트엔드 호환성을 위해 page/size 기반 페이징을 유지합니다.
     *
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 당 항목 수
     * @return 페이징된 사용자 목록
     */
    public AdminUserListResponse findAllUsers(int page, int size) {
        return findAllUsersPaginated(size, null, page);
    }

    /**
     * DynamoDB 페이지네이션을 사용하여 사용자를 조회합니다.
     *
     * @param size    페이지 당 항목 수
     * @param lastKey 이전 페이지의 마지막 키 (null이면 처음부터 시작)
     * @param page    페이지 번호 (표시용)
     * @return 페이징된 사용자 목록
     */
    public AdminUserListResponse findAllUsersPaginated(int size, String lastKey, int page) {
        UserRepository.PaginatedResult<User> result = userRepository.findAllPaginated(size, lastKey);
        long totalCount = userRepository.countAll();

        List<AdminUserResponse> users = result.items().stream()
                .map(AdminUserResponse::from)
                .toList();

        return AdminUserListResponse.of(page, size, totalCount, result.lastKey(), users);
    }
}
