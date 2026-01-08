/**
 * 관리자 흐름 시나리오 테스트
 *
 * 시나리오:
 * 1. 관리자 로그인
 * 2. 대시보드 요약 조회
 * 3. 사용자 목록 조회
 * 4. 가맹점 목록 조회
 * 5. 환율 조회
 *
 * 실행: k6 run scenarios/admin-flow.js
 *
 * 환경변수:
 * - ADMIN_USERNAME: 관리자 아이디
 * - ADMIN_PASSWORD: 관리자 비밀번호
 */
import { check, sleep, group } from 'k6';
import http from 'k6/http';
import { smokeOptions, AUTH_URL, WALLET_URL, jsonHeaders, authHeaders } from '../config/options.js';

// 관리자 테스트는 적은 VU로 실행
export const options = {
    ...smokeOptions,
    vus: 1,
    iterations: 5,
};

const ADMIN_USERNAME = __ENV.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin123!';

export default function () {
    let adminToken;

    // 1. 관리자 로그인
    group('관리자 로그인', function () {
        const res = http.post(
            `${AUTH_URL}/api/v1/admin/sign-in`,
            JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
            jsonHeaders
        );

        const success = check(res, {
            '관리자 로그인 성공': (r) => r.status === 200,
            '토큰 발급': (r) => r.json('accessToken') !== undefined,
        });

        if (success) {
            adminToken = res.json('accessToken');
        } else {
            console.error(`Admin login failed: ${res.status} - ${res.body}`);
            return;
        }
    });

    if (!adminToken) return;
    sleep(0.5);

    // 2. 대시보드 요약 조회
    group('대시보드 요약 조회', function () {
        const res = http.get(
            `${WALLET_URL}/api/v1/wallet/admin/summary`,
            authHeaders(adminToken)
        );

        check(res, {
            '대시보드 조회 성공': (r) => r.status === 200,
            '지갑 수 존재': (r) => r.json('totalWallets') !== undefined,
        });
    });
    sleep(0.3);

    // 3. 사용자 목록 조회
    group('사용자 목록 조회', function () {
        const res = http.get(
            `${AUTH_URL}/api/v1/admin/users?page=0&size=10`,
            authHeaders(adminToken)
        );

        check(res, {
            '사용자 목록 조회 성공': (r) => r.status === 200,
        });
    });
    sleep(0.3);

    // 4. 가맹점 목록 조회 (관리자)
    group('가맹점 목록 조회 (관리자)', function () {
        const res = http.get(
            `${WALLET_URL}/api/v1/wallet/admin/merchants`,
            authHeaders(adminToken)
        );

        check(res, {
            '가맹점 조회 성공': (r) => r.status === 200,
            '가맹점 목록': (r) => Array.isArray(r.json()),
        });
    });
    sleep(0.3);

    // 5. 환율 조회 (관리자)
    group('환율 조회 (관리자)', function () {
        const res = http.get(
            `${WALLET_URL}/api/v1/wallet/admin/exchange-rates`,
            authHeaders(adminToken)
        );

        check(res, {
            '환율 조회 성공': (r) => r.status === 200,
        });
    });
    sleep(0.3);

    // 6. 통화 목록 조회
    group('통화 목록 조회', function () {
        const res = http.get(
            `${WALLET_URL}/api/v1/wallet/admin/exchange-rates/currencies`,
            authHeaders(adminToken)
        );

        check(res, {
            '통화 목록 조회 성공': (r) => r.status === 200,
        });
    });

    sleep(1);
}
