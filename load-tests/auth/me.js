/**
 * 사용자 정보 조회 API 부하 테스트
 *
 * 실행: k6 run auth/me.js
 * 스모크: k6 run -e SMOKE=true auth/me.js
 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { loadOptions, smokeOptions, AUTH_URL, authHeaders } from '../config/options.js';
import { signUp, generateUser } from '../helpers/auth.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            users.push({
                accessToken: tokens.accessToken,
                phone: user.phone,
            });
        }
    }

    console.log(`Created ${users.length} test users for me test`);
    return { users };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];

    const res = http.get(
        `${AUTH_URL}/api/v1/users/me`,
        authHeaders(user.accessToken)
    );

    check(res, {
        'me: status is 200': (r) => r.status === 200,
        'me: has userId': (r) => r.json('userId') !== undefined,
        'me: phone matches': (r) => r.json('phone') === user.phone,
    });

    sleep(Math.random() * 2 + 0.5);
}
