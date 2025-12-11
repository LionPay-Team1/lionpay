# LionPay

## 사전 요구 사항 (Prerequisites)

프로젝트 실행 및 API 클라이언트 생성을 위해 다음 항목이 설치되어 있어야 한다.

*   **Java 25**
*   **NET 10.0 SDK**
*   **Node.js**

## API 클라이언트 생성 (API Client Generation)

이 프로젝트는 `lionpay-app`과 `lionpay-management`에서 사용할 TypeScript API 클라이언트를 자동으로 생성하는 스크립트를 제공한다.

### 실행 방법 (How to Run)

**Windows:**
```cmd
generate-client.bat
```

**macOS / Linux:**
```bash
./generate-client.sh
```

### 동작 방식 (What it does)

1.  **`lionpay-auth` 빌드**: Gradle 빌드를 통해 최신 OpenAPI 명세(`lionpay-auth.json`)를 생성한다.
2.  **`lionpay-wallet` 빌드**: .NET 빌드를 통해 최신 OpenAPI 명세(`lionpay-wallet.json`)를 생성한다.
3.  **클라이언트 생성**: `openapi-generator-cli`를 사용하여 다음의 TypeScript Axios 클라이언트를 생성한다.
    *   `lionpay-app` 및 `lionpay-management`용 `lionpay-auth` 클라이언트
    *   `lionpay-app` 및 `lionpay-management`용 `lionpay-wallet` 클라이언트