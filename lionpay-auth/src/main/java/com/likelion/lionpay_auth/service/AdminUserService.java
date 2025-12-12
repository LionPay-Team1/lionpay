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
            // 이 경우는 Controller에서 분기 처리되므로 발생하지 않아야 합니다.
            throw new IllegalArgumentException("조회하려면 phone 또는 userId 중 하나가 필요합니다.");
        }
        return AdminUserResponse.from(user);
    }

    /**
     * 모든 사용자를 조회하고 메모리 기반 페이징을 적용합니다.
     *
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 당 항목 수
     * @return 페이징된 사용자 목록
     */
    public AdminUserListResponse findAllUsers(int page, int size) {
        List<User> allUsers = userRepository.findAll();
        long totalCount = allUsers.size();

        // suggestion: 반복문을 Stream API로 리팩토링하여 더 효율적인 컬렉션 처리를 고려하세요.
        List<AdminUserResponse> pagedUsers = allUsers.stream()
                .skip((long) page * size)
                .limit(size)
                .map(AdminUserResponse::from)
                .toList();

        return new AdminUserListResponse(page, size, totalCount, pagedUsers);
    }
}