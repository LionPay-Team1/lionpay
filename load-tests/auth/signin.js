/**
 * 로그인 API 부하 테스트
 *
 * 실행: k6 run auth/signin.js
 * 스모크: k6 run -e SMOKE=true auth/signin.js
 */
import { sleep } from 'k6';
import { loadOptions, smokeOptions } from '../config/options.js';
import { signUp, signIn, generateUser } from '../helpers/auth.js';

// 테스트 옵션 설정
export const options = __ENV.SMOKE === 'true' ? smokeOptions : loadOptions;

// 테스트용 사용자 목록 (setup에서 생성)
let testUsers = [];

// setup: 테스트 전 사용자 생성
export function setup() {
    const users = [];
    const userCount = __ENV.SMOKE === 'true' ? 1 : 10;

    for (let i = 0; i < userCount; i++) {
        const user = generateUser();
        const tokens = signUp(user);
        if (tokens) {
            users.push({
                phone: user.phone,
                password: user.password,
            });
        }
    }

    console.log(`Created ${users.length} test users for signin test`);
    return { users };
}

// 메인 테스트 로직
export default function (data) {
    if (!data.users || data.users.length === 0) {
        console.error('No test users available');
        return;
    }

    // 랜덤 사용자 선택
    const user = data.users[Math.floor(Math.random() * data.users.length)];

    // 로그인 테스트
    signIn(user.phone, user.password);

    // 요청 간 간격 (실제 사용자 행동 시뮬레이션)
    sleep(Math.random() * 2 + 0.5); // 0.5 ~ 2.5초
}
