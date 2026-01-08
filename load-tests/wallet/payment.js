/**
 * 결제 API 부하 테스트
 *
 * 실행: k6 run wallet/payment.js
 * 스모크: k6 run -e SMOKE=true wallet/payment.js
 */
import { sleep } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, generateUser } from '../helpers/auth.js';
import { chargeWallet, processPayment, getMerchants } from '../helpers/wallet.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    // 사용자 생성 및 충전
    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            // 충분한 잔액 충전
            chargeWallet(tokens.accessToken, 1000000);
            users.push({ accessToken: tokens.accessToken });
        }
    }

    // 가맹점 목록 조회
    let merchants = [];
    if (users.length > 0) {
        const merchantsRes = getMerchants(users[0].accessToken);
        if (merchantsRes.status === 200) {
            merchants = merchantsRes.json();
        }
    }

    console.log(`Created ${users.length} users, found ${merchants.length} merchants`);
    return { users, merchants };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }
    if (!data.merchants || data.merchants.length === 0) {
        console.error('No merchants available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];
    const merchant = data.merchants[Math.floor(Math.random() * data.merchants.length)];

    // 랜덤 금액 결제 (100 ~ 10000)
    const amount = Math.floor(Math.random() * 9900) + 100;
    processPayment(user.accessToken, merchant.merchantId, amount, 'KRW');

    sleep(Math.random() * 2 + 0.5);
}
