/**
 * 거래 내역 조회 API 부하 테스트
 *
 * 실행: k6 run wallet/transactions.js
 * 스모크: k6 run -e SMOKE=true wallet/transactions.js
 */
import { sleep } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, generateUser } from '../helpers/auth.js';
import { getTransactions, chargeWallet } from '../helpers/wallet.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            // 몇 건의 거래 내역 생성
            chargeWallet(tokens.accessToken, 10000);
            chargeWallet(tokens.accessToken, 20000);
            users.push({ accessToken: tokens.accessToken });
        }
    }

    console.log(`Created ${users.length} test users for transactions test`);
    return { users };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];

    // 페이지네이션 테스트
    getTransactions(user.accessToken, 10, 0);

    sleep(Math.random() * 2 + 0.5);
}
