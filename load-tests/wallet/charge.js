/**
 * 지갑 충전 API 부하 테스트
 *
 * 실행: k6 run wallet/charge.js
 * 스모크: k6 run -e SMOKE=true wallet/charge.js
 */
import { sleep } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, generateUser } from '../helpers/auth.js';
import { chargeWallet } from '../helpers/wallet.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            users.push({ accessToken: tokens.accessToken });
        }
    }

    console.log(`Created ${users.length} test users for charge test`);
    return { users };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];

    // 랜덤 금액 충전 (1000 ~ 100000)
    const amount = Math.floor(Math.random() * 99000) + 1000;
    chargeWallet(user.accessToken, amount);

    sleep(Math.random() * 2 + 0.5);
}
