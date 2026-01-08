/**
 * 인증 헬퍼 함수
 * 테스트에서 사용할 인증 관련 유틸리티
 */
import http from 'k6/http';
import { check, fail } from 'k6';
import { AUTH_URL, jsonHeaders } from '../config/options.js';

/**
 * 테스트용 랜덤 전화번호 생성
 */
export function generatePhone() {
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `010${suffix}`;
}

/**
 * 테스트용 사용자 데이터 생성
 */
export function generateUser() {
    const phone = generatePhone();
    return {
        phone,
        password: 'Test1234!',
        name: `테스트유저_${phone.slice(-4)}`,
    };
}

/**
 * 회원가입
 * @param {Object} user - { phone, password, name }
 * @returns {Object} - { accessToken, refreshToken } 또는 null
 */
export function signUp(user) {
    const res = http.post(
        `${AUTH_URL}/api/v1/auth/sign-up`,
        JSON.stringify(user),
        jsonHeaders
    );

    const success = check(res, {
        'signup: status is 201': (r) => r.status === 201,
        'signup: has accessToken': (r) => r.json('accessToken') !== undefined,
    });

    if (!success) {
        console.error(`SignUp failed: ${res.status} - ${res.body}`);
        return null;
    }

    return res.json();
}

/**
 * 로그인
 * @param {string} phone
 * @param {string} password
 * @returns {Object} - { accessToken, refreshToken } 또는 null
 */
export function signIn(phone, password) {
    const res = http.post(
        `${AUTH_URL}/api/v1/auth/sign-in`,
        JSON.stringify({ phone, password }),
        jsonHeaders
    );

    const success = check(res, {
        'signin: status is 200': (r) => r.status === 200,
        'signin: has accessToken': (r) => r.json('accessToken') !== undefined,
    });

    if (!success) {
        console.error(`SignIn failed: ${res.status} - ${res.body}`);
        return null;
    }

    return res.json();
}

/**
 * 토큰 갱신
 * @param {string} refreshToken
 * @returns {Object} - { accessToken, refreshToken } 또는 null
 */
export function refreshToken(refreshToken) {
    const res = http.post(
        `${AUTH_URL}/api/v1/auth/refresh-token`,
        JSON.stringify({ refreshToken }),
        jsonHeaders
    );

    const success = check(res, {
        'refresh: status is 200': (r) => r.status === 200,
        'refresh: has accessToken': (r) => r.json('accessToken') !== undefined,
    });

    if (!success) {
        console.error(`Refresh failed: ${res.status} - ${res.body}`);
        return null;
    }

    return res.json();
}

/**
 * 관리자 로그인
 * @param {string} username
 * @param {string} password
 * @returns {Object} - { accessToken, refreshToken } 또는 null
 */
export function adminSignIn(username, password) {
    const res = http.post(
        `${AUTH_URL}/api/v1/admin/sign-in`,
        JSON.stringify({ username, password }),
        jsonHeaders
    );

    const success = check(res, {
        'admin signin: status is 200': (r) => r.status === 200,
        'admin signin: has accessToken': (r) => r.json('accessToken') !== undefined,
    });

    if (!success) {
        console.error(`Admin SignIn failed: ${res.status} - ${res.body}`);
        return null;
    }

    return res.json();
}

/**
 * 사용자 생성 및 로그인 (setup 단계용)
 * 이미 존재하는 사용자면 로그인만 시도
 */
export function setupUser() {
    const user = generateUser();

    // 먼저 회원가입 시도
    let tokens = signUp(user);

    // 이미 존재하면 로그인 시도
    if (!tokens) {
        tokens = signIn(user.phone, user.password);
    }

    if (!tokens) {
        fail('Failed to setup user');
    }

    return {
        user,
        tokens,
    };
}
