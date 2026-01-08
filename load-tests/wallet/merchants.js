/**
 * 가맹점 조회 API 부하 테스트
 *
 * 실행: k6 run wallet/merchants.js
 * 스모크: k6 run -e SMOKE=true wallet/merchants.js
 */
import { sleep } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, generateUser } from '../helpers/auth.js';
import { getMerchants } from '../helpers/wallet.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 5;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            users.push({ accessToken: tokens.accessToken });
        }
    }

    console.log(`Created ${users.length} test users for merchants test`);
    return { users };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];

    // 전체 가맹점 조회
    getMerchants(user.accessToken);

    // 국가별 가맹점 조회 테스트
    const countries = ['KR', 'JP', 'US'];
    const country = countries[Math.floor(Math.random() * countries.length)];
    getMerchants(user.accessToken, country);

    sleep(Math.random() * 2 + 0.5);
}
