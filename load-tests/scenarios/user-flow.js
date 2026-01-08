/**
 * 사용자 전체 흐름 E2E 시나리오 테스트
 *
 * 시나리오:
 * 1. 회원가입
 * 2. 로그인
 * 3. 지갑 조회
 * 4. 지갑 충전
 * 5. 가맹점 조회
 * 6. 결제
 * 7. 거래 내역 조회
 * 8. 환율 조회
 *
 * 실행: k6 run scenarios/user-flow.js
 * 스모크: k6 run -e SMOKE=true scenarios/user-flow.js
 */
import { check, sleep, group } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, signIn, generateUser, refreshToken } from '../helpers/auth.js';
import {
    getMyWallet,
    chargeWallet,
    processPayment,
    getTransactions,
    getMerchants,
    getExchangeRates
} from '../helpers/wallet.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export default function () {
    // 1. 회원가입
    let tokens;
    let user;

    group('회원가입', function () {
        user = generateUser();
        tokens = signUp(user);

        if (!tokens) {
            console.error('회원가입 실패, 테스트 중단');
            return;
        }
    });

    if (!tokens) return;
    sleep(0.5);

    // 2. 로그인 (토큰 갱신 테스트를 위해 다시 로그인)
    group('로그인', function () {
        const loginTokens = signIn(user.phone, user.password);
        if (loginTokens) {
            tokens = loginTokens;
        }
    });
    sleep(0.5);

    // 3. 지갑 조회
    group('지갑 조회', function () {
        const walletRes = getMyWallet(tokens.accessToken);
        check(walletRes, {
            '지갑 조회 성공': (r) => r.status === 200,
        });
    });
    sleep(0.3);

    // 4. 지갑 충전
    group('지갑 충전', function () {
        const chargeRes = chargeWallet(tokens.accessToken, 100000);
        check(chargeRes, {
            '충전 성공': (r) => r.status === 200,
            '잔액 증가': (r) => r.json('balance') >= 100000,
        });
    });
    sleep(0.3);

    // 5. 가맹점 조회
    let merchants = [];
    group('가맹점 조회', function () {
        const merchantsRes = getMerchants(tokens.accessToken);
        if (merchantsRes.status === 200) {
            merchants = merchantsRes.json();
        }
        check(merchantsRes, {
            '가맹점 조회 성공': (r) => r.status === 200,
        });
    });
    sleep(0.3);

    // 6. 결제 (가맹점이 있는 경우)
    if (merchants.length > 0) {
        group('결제', function () {
            const merchant = merchants[0];
            const paymentRes = processPayment(
                tokens.accessToken,
                merchant.merchantId,
                1000,
                'KRW'
            );
            check(paymentRes, {
                '결제 성공': (r) => r.status === 200,
                '트랜잭션 ID 존재': (r) => r.json('txId') !== undefined,
            });
        });
        sleep(0.3);
    }

    // 7. 거래 내역 조회
    group('거래 내역 조회', function () {
        const txRes = getTransactions(tokens.accessToken, 10, 0);
        check(txRes, {
            '거래 내역 조회 성공': (r) => r.status === 200,
            '거래 내역 존재': (r) => r.json().length > 0,
        });
    });
    sleep(0.3);

    // 8. 환율 조회
    group('환율 조회', function () {
        const ratesRes = getExchangeRates(tokens.accessToken);
        check(ratesRes, {
            '환율 조회 성공': (r) => r.status === 200,
        });
    });
    sleep(0.3);

    // 9. 토큰 갱신
    group('토큰 갱신', function () {
        const newTokens = refreshToken(tokens.refreshToken);
        check(newTokens, {
            '토큰 갱신 성공': (t) => t !== null && t.accessToken !== undefined,
        });
    });

    // 사용자 행동 시뮬레이션 - 다음 iteration까지 대기
    sleep(Math.random() * 3 + 1);
}
