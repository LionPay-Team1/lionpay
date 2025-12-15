# LionPay

## 개발환경 구성 (Development Environment Setup)

### SDK 설치 (SDK Installation)

프로젝트를 실행하려면 다음 SDK들을 설치해야 한다.

| SDK | 용도 | 설치 링크 |
|-----|------|-----------|
| **Bun** | 프론트엔드 개발 | [bun installation guide](https://bun.sh/docs/installation) |
| **Java 25 (Temurin)** | 백엔드 (Spring Boot) | [sdk install link](https://adoptium.net/temurin/releases/?version=25&os=any&arch=any) |
| **.NET 10.0 SDK** | 백엔드 (ASP.NET) | [sdk install link](https://dotnet.microsoft.com/en-us/download/dotnet/10.0) |

---

### 프론트엔드 실행 (Frontend)

프론트엔드는 **Bun**을 패키지 매니저 및 런타임으로 사용한다.

#### lionpay-app (고객용 앱)

```bash
cd lionpay-app
bun install
bun run dev
```

#### lionpay-management (관리자용 앱)

```bash
cd lionpay-management
bun install
bun run dev
```

---

### 백엔드 실행 (Backend)

백엔드는 **Spring Boot** (Java)와 **ASP.NET** (.NET)으로 구성되어 있다.

* **lionpay-auth**: Spring Boot 기반 인증 서비스
* **lionpay-wallet**: ASP.NET 기반 지갑 서비스

> [!NOTE]
> 백엔드 서비스는 개별 실행보다 통합 테스트 환경(Docker Compose 또는 Aspire)을 통해 실행하는 것을 권장한다.

---

## 통합 테스트 환경 (Integration Test Environment)

통합 테스트를 위한 두 가지 방법을 제공한다.

### 1. Docker Compose

Docker 기반으로 모든 서비스를 컨테이너로 실행한다.

**사전 요구 사항:**

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치

**실행 방법:**

```bash
docker compose up -d --build
```

---

### 2. .NET Aspire

Aspire는 로컬 개발 환경에서 모든 서비스를 오케스트레이션하며, **OpenTelemetry** 기반으로 로그, 추적(Trace), 성능 지표(Metrics)를 대시보드에서 쉽게 확인할 수 있다.

**사전 요구 사항:**

* 위의 모든 SDK (Bun, Java SDK, .NET SDK) 설치 필요
* Aspire CLI 설치

**Aspire CLI 설치:**

```bash
# bash
curl -sSL https://aspire.dev/install.sh | bash

# PowerShell
irm https://aspire.dev/install.ps1 | iex
```

> 자세한 내용: [Aspire CLI 문서](https://aspire.dev/get-started/install-cli/)

**실행 방법:**

```bash
aspire run
```

**Aspire의 장점:**

* OpenTelemetry 기반 통합 대시보드 제공
* 로그, 분산 추적, 성능 지표를 한 곳에서 확인 가능
* 서비스 간 의존성 시각화

---

## API 클라이언트 생성 (API Client Generation)

이 프로젝트는 `lionpay-app`과 `lionpay-management`에서 사용할 TypeScript API 클라이언트를 자동으로 생성하는 스크립트를 제공한다.

### 실행 방법

**Windows:**

```cmd
generate-client.bat
```

**macOS / Linux:**

```bash
./generate-client.sh
```
