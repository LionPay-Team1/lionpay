/**
 * 회원가입 API 부하 테스트
 *
 * 실행: k6 run auth/signup.js
 * 스모크: k6 run -e SMOKE=true auth/signup.js
 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { loadOptions, smokeOptions, AUTH_URL, jsonHeaders } from '../config/options.js';
import { generateUser } from '../helpers/auth.js';

export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

export default function () {
    const user = generateUser();

    const res = http.post(
        `${AUTH_URL}/api/v1/auth/sign-up`,
        JSON.stringify(user),
        jsonHeaders
    );

    check(res, {
        'signup: status is 201': (r) => r.status === 201,
        'signup: has accessToken': (r) => r.json('accessToken') !== undefined,
        'signup: has refreshToken': (r) => r.json('refreshToken') !== undefined,
    });

    sleep(Math.random() * 2 + 0.5);
}
