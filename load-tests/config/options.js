/**
 * k6 공통 옵션 설정
 * 성능 요구사항: QPS 50, P95 700ms 이하
 */

// 환경 변수에서 URL 가져오기
// 단일 Ingress 사용 시: BASE_URL만 설정 (예: https://lionpay.shop)
// 개별 서비스 사용 시: AUTH_URL, WALLET_URL 각각 설정
const BASE_URL = __ENV.BASE_URL || '';
export const AUTH_URL = __ENV.AUTH_URL || (BASE_URL || 'http://localhost:8080');
export const WALLET_URL = __ENV.WALLET_URL || (BASE_URL || 'http://localhost:5000');

// 공통 헤더
export const jsonHeaders = {
    headers: {
        'Content-Type': 'application/json',
    },
};

// 인증 헤더 생성
export function authHeaders(token) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
}

// 스모크 테스트 옵션 (기능 확인용)
export const smokeOptions = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_failed: ['rate==0'],
    },
};

// 부하 테스트 기본 옵션
export const loadOptions = {
    thresholds: {
        http_req_duration: ['p(95)<700'], // P95 700ms 이하
        http_req_failed: ['rate<0.01'],   // 에러율 1% 미만
    },
    stages: [
        { duration: '30s', target: 10 },  // 웜업: 10 VUs까지 증가
        { duration: '1m', target: 50 },   // 램프업: 50 VUs까지 증가
        { duration: '2m', target: 50 },   // 유지: 50 VUs로 2분간 유지
        { duration: '30s', target: 0 },   // 쿨다운
    ],
};

// 스트레스 테스트 옵션 (한계 확인용)
export const stressOptions = {
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 스트레스 시 P95 1초
        http_req_failed: ['rate<0.05'],    // 에러율 5% 미만
    },
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },  // 한계 테스트
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
    ],
};

// 스파이크 테스트 옵션 (순간 부하 대응 확인)
export const spikeOptions = {
    thresholds: {
        http_req_duration: ['p(95)<1500'],
        http_req_failed: ['rate<0.1'],
    },
    stages: [
        { duration: '10s', target: 10 },
        { duration: '5s', target: 100 },   // 급격한 스파이크
        { duration: '30s', target: 100 },
        { duration: '5s', target: 10 },    // 급격한 감소
        { duration: '10s', target: 0 },
    ],
};
