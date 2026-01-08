/**
 * 토큰 갱신 API 부하 테스트
 *
 * 실행: k6 run auth/refresh.js
 * 스모크: k6 run -e SMOKE=true auth/refresh.js
 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { loadOptions, smokeOptions, AUTH_URL, jsonHeaders } from '../config/options.js';
import { signUp, generateUser, refreshToken } from '../helpers/auth.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

let testUsers = [];

export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            users.push({
                refreshToken: tokens.refreshToken,
            });
        }
    }

    console.log(`Created ${users.length} test users for refresh test`);
    return { users };
}

export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    const user = data.users[Math.floor(Math.random() * data.users.length)];

    // 토큰 갱신 테스트
    const newTokens = refreshToken(user.refreshToken);

    // 갱신된 토큰으로 다시 갱신 (연속 갱신 테스트)
    if (newTokens) {
        user.refreshToken = newTokens.refreshToken;
    }

    sleep(Math.random() * 2 + 0.5);
}
