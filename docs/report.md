# LionPay 프로젝트 분석 보고서

## 1. 시스템 아키텍처 설계 (서비스 구조)

LionPay 프로젝트는 마이크로서비스 아키텍처(MSA)를 기반으로 하며, 배포 환경에 따라 다음과 같은 인프라 구성을 가진다.

- **Local Development**: Docker Compose와 .NET Aspire를 이용한 로컬 실행.
- **Production (AWS)**: Amazon EKS (Elastic Kubernetes Service)를 이용한 컨테이너 오케스트레이션.

주요 서비스 구성 및 인프라 매핑은 다음과 같다.

- **Auth Service (`lionpay-auth`)**: 사용자 인증 및 권한 관리를 담당하는 Java/Spring Boot 기반 서비스.
  - **DB**: AWS DynamoDB (Local: DynamoDB Local)
- **Wallet Service (`lionpay-wallet`)**: 전자지갑 및 결제 트랜잭션을 처리하는 .NET 기반 서비스.
  - **DB**: AWS DSQL (Local: PostgreSQL)
- **App Service (`lionpay-app`)**: 사용자용 프론트엔드/백엔드 애플리케이션 (Node.js/Next.js).
- **Management Service (`lionpay-management`)**: 관리자용 대시보드 및 관리 도구.

서비스 간 통신은 HTTP REST API를 사용하며, API Gateway 역할은 별도로 명시되지 않았으나 각 서비스가 독립적인 포트로 노출된다.

---

## 2. 도메인, 데이터 모델 구조

### 2.1 Authentiction (Auth Service) - DynamoDB

Auth 서비스는 AWS DynamoDB(로컬: DynamoDB Local)를 사용하여 유저 및 인증 정보를 관리한다.

- **User**: 사용자 기본 정보
  - `userId` (Partition Key): 고유 식별자 (UUID)
  - `phone`: 전화번호 (로그인 ID 역할, @DynamoDbPartitionKey로 설정됨)
  - `password`: 암호화된 비밀번호
  - `name`: 사용자 이름
  - `status`: 계정 상태 (예: ACTIVE)
  - `createdAt`: 생성 일시
  - `updatedAt`: 수정 일시
- **RefreshTokenEntity**: 리프레시 토큰 관리
- **AdminEntity**: 관리자 계정 정보

### 2.2 Wallet (Wallet Service) - DSQL (Local: PostgreSQL)

Wallet 서비스는 AWS DSQL(로컬: PostgreSQL)을 사용하여 지갑 및 거래 내역을 관리한다.

- **WalletModel**: 지갑 정보
  - `WalletId` (PK): 지갑 고유 ID (UUID)
  - `UserId`: 사용자 ID (Auth 서비스와 연동)
  - `WalletType`: 지갑 유형 (Enum: Money, Point 등)
  - `Balance`: 현재 잔액 (Decimal)
  - `Version`: Optimistic Locking을 위한 버전 관리
  - `CreatedAt`, `UpdatedAt`: 생성 및 수정 일시

---

## 3. 핵심 API 명세

### 3.1 Auth Service API (`/api/v1/auth`)

| Method | Endpoint | 설명 | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/sign-up` | 회원가입 | `SignUpRequest` (phone, password, name 등) | `201 Created` <br> `{ accessToken, refreshToken }` |
| **POST** | `/sign-in` | 로그인 | `SignInRequest` (phone, password) | `200 OK` <br> `{ accessToken, refreshToken }` |
| **POST** | `/sign-out` | 로그아웃 | `SignOutRequest` (refreshToken optional) | `200 OK` <br> `{ message }` |
| **POST** | `/refresh-token` | 토큰 재발급 | `RefreshTokenRequest` (refreshToken) | `200 OK` <br> `{ accessToken, refreshToken }` |

### 3.2 Wallet Service API (`/api/v1/wallets`)

| Method | Endpoint | 설명 | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/me` | 내 지갑 조회 | Query `type` (optional) | `200 OK` <br> `WalletResponse` 또는 `List<WalletResponse>` |
| **POST** | `/charge` | 지갑 충전 | `ChargeRequest` (amount) | `200 OK` <br> `WalletResponse` |

---

## 4. API 에러 응답 구조

두 서비스는 각자의 표준화된 에러 응답 포맷을 가지고 있다.

### 4.1 Auth Service (Java/Spring)

Map 형태의 JSON 응답을 반환한다.

```json
{
  "errorCode": "STRING_CODE",
  "message": "사람이 읽을 수 있는 에러 메시지",
  "errors": { ... } // (Optional) 유효성 검사 실패 시 세부 필드 에러
}
```

- **주요 Error Code**:
  - `DUPLICATED_USER`: 이미 존재하는 사용자
  - `USER_NOT_FOUND`: 존재하지 않는 사용자
  - `INVALID_PASSWORD`: 비밀번호 불일치
  - `TOKEN_NOT_FOUND`: 토큰을 찾을 수 없음
  - `INVALID_TOKEN`: 유효하지 않거나 만료된 토큰
  - `INVALID_REQUEST`: 입력값(Validation) 오류
  - `INTERNAL_SERVER_ERROR`: 서버 내부 오류

### 4.2 Wallet Service (.NET)

`ErrorResponse` 객체를 직렬화하여 반환한다.

```json
{
  "errorCode": "STRING_CODE",
  "errorMessage": "에러 상세 메시지"
}
```

- **주요 Error Code**:
  - Authorization: `UNAUTHENTICATED`, `PERMISSION_DENIED`
  - General: `INTERNAL_SERVER_ERROR`, `BAD_REQUEST`
  - Domain: `WALLET_NOT_FOUND`, `INSUFFICIENT_BALANCE`, `CHARGE_FAILED`

---

## 5. API 인증 구조

전반적으로 **JWT (JSON Web Token)** 기반의 인증 방식을 채택하고 있다.

- **인증 흐름**:
    1. 클라이언트가 Auth Service의 `/sign-in` API를 통해 로그인.
    2. Auth Service는 `accessToken`과 `refreshToken`을 발급.
    3. 클라이언트는 `Authorization: Bearer <accessToken>` 헤더를 사용하여 다른 서비스(Wallet 등)의 보호된 API를 호출.
- **토큰 검증**:
  - 각 서비스(예: Wallet Service)는 설정된 JWT Secret, Issuer, Audience 정보를 바탕으로 토큰의 서명 및 유효성을 자체적으로 검증한다 (`JwtBearerMiddleware`).
  - 만료된 토큰은 `refreshToken`을 사용하여 Auth Service에서 재발급받아야 한다.
- **권한 부여 (Authorization)**:
  - Role 기반 접근 제어 (RBAC)가 적용되어 있다.
  - 일반 사용자(`UserRole`)와 관리자(`AdminRole`, `SuperAdmin`)로 구분된다.

---

## 6. 로컬 실행 방법

프로젝트 루트에 위치한 `docker-compose.yaml`을 통해 전체 서비스를 로컬에서 실행할 수 있다.

1. **필수 요구 사항 확인**: Docker, Java 25, .NET 10.0 SDK, Node.js 설치 확인.
2. **서비스 실행**:

    ```bash
    docker-compose up -d –-build
    ```

    이 명령어는 다음 컨테이너들을 실행한다:
    - `postgres`: 포트 9955 -> 5432
    - `dynamodb`: 포트 8000 -> 8000
    - `auth-service`: 포트 7755 -> 8080
    - `wallet-service`: 포트 8855 -> 8080
    - `app-service`: 포트 8866 -> 80
    - `management-service`: 포트 8877 -> 80

3. **API 클라이언트 생성** (선택 사항):
    - Windows: `generate-client.bat`
    - macOS/Linux: `./generate-client.sh`
    - 이 스크립트는 Auth 및 Wallet 서비스를 빌드하여 OpenAPI 명세를 추출하고, 이를 기반으로 TypeScript API 클라이언트를 생성한다.

---

## 7. 개발 워크플로우 (CI/CD)

### 7.1 브랜치 전략 및 병합 (Branching & Merge)

본 프로젝트는 **Pull Request (PR)** 기반의 협업 방식을 따른다.

- **Branching**: 기능 개발 시 `main` 브랜치에서 feature 브랜치를 분기하여 작업한다.
- **Merge Strategy**: PR 병합 시 **Squash Merge**를 사용하여 커밋 히스토리를 단일 커밋으로 압축, 메인 브랜치의 이력을 깔끔하게 유지하는 것을 권장한다.

### 7.2 자동화 테스트 (CI Pipeline)

GitHub Actions Workflow (`.github/workflows/check.yml`)가 PR 생성 및 업데이트 시 자동으로 실행되어 코드 무결성을 검증한다. 병합 전 다음 테스트들이 모두 통과해야 한다.

- **Integrations Test**: `Aspire` 기반 통합 테스트 (`dotnet test`)
- **Auth Service**: Java/Gradle 기반 단위 테스트 (`./gradlew test`)
- **Wallet Service**: 코드 포맷팅 검증 (`dotnet format --verify-no-changes`) (※ 단위 테스트는 현재 비활성화됨)
- **App & Management**: Node.js 기반 린트 검사 (`npm run lint`)
