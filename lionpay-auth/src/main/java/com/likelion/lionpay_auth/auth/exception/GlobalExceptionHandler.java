package com.likelion.lionpay_auth.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.io.PrintWriter; // 추가
import java.io.StringWriter; // 추가

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserAlreadyExists(UserAlreadyExistsException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "DUPLICATED_USER");
        errorResponse.put("message", "이미 존재하는 사용자입니다");

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(errorResponse);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException e) {
        Map<String, String> errorResponse = new HashMap<>();

        if (e.getMessage().contains("존재하지")) {
            errorResponse.put("errorCode", "USER_NOT_FOUND");
            errorResponse.put("message", "존재하지 않는 사용자입니다");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse); // 404
        } else {
            errorResponse.put("errorCode", "INVALID_PASSWORD");
            errorResponse.put("message", "비밀번호가 일치하지 않습니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse); // 401
        }
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, String>> handleInvalidToken(InvalidTokenException e) {
        Map<String, String> errorResponse = new HashMap<>();

        if (e.getMessage().contains("찾을")) {
            errorResponse.put("errorCode", "TOKEN_NOT_FOUND");
            errorResponse.put("message", "이미 로그아웃된 사용자입니다");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse); // 404
        } else {
            errorResponse.put("errorCode", "INVALID_TOKEN");
            errorResponse.put("message", "유효하지 않은 토큰입니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse); // 401
        }
    }

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
                .status(HttpStatus.BAD_REQUEST) // 400
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {

        // [수정] 핸들러 도달 확인 및 강제 출력 시작
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);

        System.out.println("$$$$$$$$$$ GLOBAL EXCEPTION HANDLER CALLED $$$$$$$$$$");
        System.out.println("$$$$$$$$$$ FULL STACK TRACE START $$$$$$$$$$");
        System.out.println(sw.toString()); // String으로 변환된 전체 Stack Trace 출력
        System.out.println("$$$$$$$$$$ FULL STACK TRACE END $$$$$$$$$$");

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("errorCode", "INTERNAL_SERVER_ERROR");
        errorResponse.put("message", "서버 오류가 발생했습니다");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }
}