package com.likelion.lionpay_auth.exception;

public class InvalidTokenFormatOrExpiredException extends RuntimeException {
    public InvalidTokenFormatOrExpiredException(String message) {
        super(message);
    }
}