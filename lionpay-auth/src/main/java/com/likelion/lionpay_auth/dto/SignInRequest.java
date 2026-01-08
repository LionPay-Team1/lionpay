package com.likelion.lionpay_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignInRequest {
	@NotBlank(message = "휴대폰 번호는 필수입니다")
	@Pattern(regexp = "^\\+82\\d{9,10}$", message = "올바른 전화번호 형식이 아닙니다 (E.164 포맷, 예: +821012345678)")
	private String phone;

	@NotBlank(message = "비밀번호는 필수입니다")
	private String password;
}
