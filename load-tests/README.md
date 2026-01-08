# LionPay K6 부하 테스트

LionPay Auth 및 Wallet API의 성능을 검증하기 위한 k6 부하 테스트 스크립트입니다.

## 성능 요구사항

| 지표 | 목표 |
|------|------|
| QPS | 50 요청/초 |
| P95 응답시간 | 700ms 이하 |
| 에러율 | 1% 미만 |

## 사전 요구사항

### k6 설치

```bash
# Windows
winget install Grafana.k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

### 서비스 실행

테스트 전에 LionPay 서비스가 실행 중이어야 합니다.

```bash
# Aspire로 실행
cd d:\workspace\likelion-cloud\project3\lionpay
aspire run

# 또는 Docker Compose로 실행
docker compose up -d
```

## 디렉토리 구조

```
load-tests/
├── config/
│   └── options.js          # 공통 설정 (URL, 헤더, 테스트 옵션)
├── helpers/
│   ├── auth.js             # 인증 헬퍼 함수
│   └── wallet.js           # 지갑 서비스 헬퍼 함수
├── auth/                   # Auth API 개별 테스트
│   ├── signin.js
│   ├── signup.js
│   ├── refresh.js
│   └── me.js
├── wallet/                 # Wallet API 개별 테스트
│   ├── me.js
│   ├── charge.js
│   ├── payment.js
│   ├── transactions.js
│   ├── merchants.js
│   └── exchange-rates.js
├── scenarios/              # 통합 시나리오 테스트
│   ├── user-flow.js        # 사용자 전체 흐름
│   └── admin-flow.js       # 관리자 흐름
└── README.md
```

## 테스트 실행

### 스모크 테스트 (기능 확인)

```bash
cd d:\workspace\likelion-cloud\project3\lionpay\load-tests

# 개별 API 스모크 테스트
k6 run -e SMOKE=true auth/signin.js
k6 run -e SMOKE=true wallet/charge.js

# 전체 사용자 흐름 스모크 테스트
k6 run -e SMOKE=true scenarios/user-flow.js
```

### 부하 테스트

```bash
# 로그인 API 부하 테스트
k6 run auth/signin.js

# 결제 API 부하 테스트
k6 run wallet/payment.js

# 사용자 전체 흐름 부하 테스트 (권장)
k6 run scenarios/user-flow.js
```

### 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `AUTH_URL` | `http://localhost:8080` | Auth 서비스 URL |
| `WALLET_URL` | `http://localhost:5000` | Wallet 서비스 URL |
| `SMOKE` | `false` | 스모크 테스트 모드 |
| `ADMIN_USERNAME` | `admin` | 관리자 아이디 |
| `ADMIN_PASSWORD` | `admin123!` | 관리자 비밀번호 |

```bash
# 커스텀 URL로 실행
k6 run -e AUTH_URL=https://auth.lionpay.com -e WALLET_URL=https://wallet.lionpay.com scenarios/user-flow.js
```

## 테스트 결과 분석

### 주요 지표

- `http_req_duration`: 요청 응답 시간 (p95 < 700ms 확인)
- `http_req_failed`: 실패율 (1% 미만 확인)
- `vus_max`: 최대 VU 수 (50 도달 확인)
- `checks`: 검증 성공률

### 결과 저장

```bash
# JSON 출력
k6 run --out json=results.json scenarios/user-flow.js

# HTML 리포트 (k6-reporter 확장 필요)
k6 run --out web-dashboard scenarios/user-flow.js
```

### Grafana 연동

```bash
# InfluxDB로 결과 전송
k6 run --out influxdb=http://localhost:8086/k6 scenarios/user-flow.js
```

## 테스트 시나리오 설명

### 사용자 흐름 (`scenarios/user-flow.js`)

1. 회원가입 → 2. 로그인 → 3. 지갑 조회 → 4. 충전 → 5. 가맹점 조회 → 6. 결제 → 7. 거래 내역 조회 → 8. 환율 조회 → 9. 토큰 갱신

### 관리자 흐름 (`scenarios/admin-flow.js`)

1. 관리자 로그인 → 2. 대시보드 조회 → 3. 사용자 목록 → 4. 가맹점 관리 → 5. 환율 조회

## 부하 테스트 단계

| 단계 | 지속시간 | VUs | 목적 |
|------|----------|-----|------|
| 웜업 | 30초 | 0→10 | 서비스 준비 |
| 램프업 | 1분 | 10→50 | 점진적 부하 증가 |
| 유지 | 2분 | 50 | 안정성 테스트 |
| 쿨다운 | 30초 | 50→0 | 정상 종료 |
