package com.likelion.lionpay_auth.exception;

import com.likelion.lionpay_auth.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	// 1. 사용자 이미 존재 (409 Conflict)
	@ExceptionHandler(UserAlreadyExistsException.class)
	public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException e) {
		ErrorResponse response = new ErrorResponse("DUPLICATED_USER", "이미 존재하는 사용자입니다");
		return ResponseEntity
				.status(HttpStatus.CONFLICT) // 409
				.body(response);
	}

	// 2. 사용자 없음 (404 Not Found)
	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException e) {
		ErrorResponse response = new ErrorResponse("USER_NOT_FOUND", "존재하지 않는 사용자입니다");
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// 3. 비밀번호 불일치 (401 Unauthorized)
	@ExceptionHandler(PasswordMismatchException.class)
	public ResponseEntity<ErrorResponse> handlePasswordMismatch(PasswordMismatchException e) {
		ErrorResponse response = new ErrorResponse("INVALID_PASSWORD", "비밀번호가 일치하지 않습니다");
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	}

	// 4. Refresh Token DB에 없음 (404 Not Found)
	@ExceptionHandler(RefreshTokenNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleRefreshTokenNotFound(RefreshTokenNotFoundException e) {
		ErrorResponse response = new ErrorResponse("TOKEN_NOT_FOUND", "이미 로그아웃되었거나 만료된 토큰입니다");
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// 5. 토큰 형식 오류 또는 유효기간 만료 (401 Unauthorized)
	// suggestion: InvalidTokenException을 처리하도록 핸들러를 수정합니다.
	@ExceptionHandler(InvalidTokenException.class)
	public ResponseEntity<ErrorResponse> handleInvalidTokenFormat(InvalidTokenException e) {
		ErrorResponse response = new ErrorResponse("INVALID_TOKEN", e.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	}

	// 6. 입력값 유효성 검사 실패 (400 Bad Request)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationExceptions(
			MethodArgumentNotValidException e) {
		Map<String, String> errors = new HashMap<>();
		e.getBindingResult().getAllErrors().forEach((error) -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			errors.put(fieldName, errorMessage);
		});

		ErrorResponse response = new ErrorResponse("INVALID_REQUEST", "입력값이 유효하지 않습니다", errors);

		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(response);
	}

	// 7. HTTP 메서드 미지원 (405 Method Not Allowed)
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
		ErrorResponse response = new ErrorResponse("METHOD_NOT_ALLOWED", "지원하지 않는 HTTP 메서드입니다: " + e.getMethod());
		return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
	}

	// 8. 리소스를 찾을 수 없음 (404 Not Found)
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException e) {
		ErrorResponse response = new ErrorResponse("NOT_FOUND", "요청한 리소스를 찾을 수 없습니다: " + e.getResourcePath());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// 9. 기타 서버 오류 (500 Internal Server Error)
	// ⚠️ 레거시 InvalidCredentialsException 핸들러가 제거되어 UserNotFoundException,
	// PasswordMismatchException이 명확히 처리됩니다.
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
		// suggestion: 예상치 못한 오류 발생 시, 원인 파악을 위해 스택 트레이스를 로그로 남기는 것이 좋습니다.
		log.error("$$$$$$$$$$ UNHANDLED EXCEPTION OCCURRED $$$$$$$$$$", e);
		ErrorResponse response = new ErrorResponse("INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다");

		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(response);
	}

	// 8. 관리자 없음 (404 Not Found)
	@ExceptionHandler(AdminNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleAdminNotFoundException(AdminNotFoundException e) {
		ErrorResponse response = new ErrorResponse("ADMIN_NOT_FOUND", e.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// 9. 유효하지 않은 자격 증명 (401 Unauthorized)
	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(InvalidCredentialsException e) {
		ErrorResponse response = new ErrorResponse("INVALID_TOKEN", e.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	}

	// 10. 관리자 중복 (409 Conflict)
	@ExceptionHandler(DuplicateAdminException.class)
	public ResponseEntity<ErrorResponse> handleDuplicateAdminException(DuplicateAdminException e) {
		ErrorResponse response = new ErrorResponse("DUPLICATE_ADMIN", e.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}
}
