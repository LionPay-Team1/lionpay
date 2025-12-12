package com.likelion.lionpay_auth.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. 사용자 이미 존재 (409 Conflict)
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserAlreadyExists(UserAlreadyExistsException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "DUPLICATED_USER");
        errorResponse.put("message", "이미 존재하는 사용자입니다");

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(errorResponse);
    }

    // 2. 사용자 없음 (404 Not Found)
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "USER_NOT_FOUND");
        errorResponse.put("message", "존재하지 않는 사용자입니다");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 3. 비밀번호 불일치 (401 Unauthorized)
    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<Map<String, String>> handlePasswordMismatch(PasswordMismatchException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "INVALID_PASSWORD");
        errorResponse.put("message", "비밀번호가 일치하지 않습니다");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    // 4. Refresh Token DB에 없음 (404 Not Found)
    @ExceptionHandler(RefreshTokenNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRefreshTokenNotFound(RefreshTokenNotFoundException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "TOKEN_NOT_FOUND");
        errorResponse.put("message", "이미 로그아웃되었거나 만료된 토큰입니다");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    // 5. 토큰 형식 오류 또는 유효기간 만료 (401 Unauthorized)
    @ExceptionHandler(InvalidTokenFormatOrExpiredException.class)
    public ResponseEntity<Map<String, String>> handleInvalidTokenFormat(InvalidTokenFormatOrExpiredException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "INVALID_TOKEN");
        errorResponse.put("message", "유효하지 않거나 만료된 토큰입니다");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    // 6. 입력값 유효성 검사 실패 (400 Bad Request)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "INVALID_REQUEST");
        errorResponse.put("message", "입력값이 유효하지 않습니다");
        errorResponse.put("errors", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    // 7. 기타 서버 오류 (500 Internal Server Error)
    // ⚠️ 레거시 InvalidCredentialsException 핸들러가 제거되어 UserNotFoundException, PasswordMismatchException이 명확히 처리됩니다.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        // suggestion: 예상치 못한 오류 발생 시, 원인 파악을 위해 스택 트레이스를 로그로 남기는 것이 좋습니다.
        log.error("$$$$$$$$$$ UNHANDLED EXCEPTION OCCURRED $$$$$$$$$$", e);
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "INTERNAL_SERVER_ERROR");
        errorResponse.put("message", "서버 오류가 발생했습니다");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    // suggestion: 다른 핸들러와 일관성을 유지하기 위해 Map<String, String>을 반환하도록 수정합니다.
	@ExceptionHandler(AdminNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleAdminNotFoundException(AdminNotFoundException e) {
		Map<String, String> errorResponse = new HashMap<>();
		errorResponse.put("errorCode", "ADMIN_NOT_FOUND");
		errorResponse.put("message", e.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
	}

    // suggestion: 다른 핸들러와 일관성을 유지하기 위해 Map<String, String>을 반환하도록 수정합니다.
	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<Map<String, String>> handleInvalidCredentialsException(InvalidCredentialsException e) {
		Map<String, String> errorResponse = new HashMap<>();
		errorResponse.put("errorCode", "INVALID_TOKEN");
		errorResponse.put("message", e.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
	}

    // suggestion: 다른 핸들러와 일관성을 유지하기 위해 Map<String, String>을 반환하도록 수정합니다.
	@ExceptionHandler(DuplicateAdminException.class)
	public ResponseEntity<Map<String, String>> handleDuplicateAdminException(DuplicateAdminException e) {
		Map<String, String> errorResponse = new HashMap<>();
		errorResponse.put("errorCode", "DUPLICATE_ADMIN");
		errorResponse.put("message", e.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
	}
}
