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

---

## 커스텀 메트릭 (Custom Metrics)

이 프로젝트는 OpenTelemetry를 사용하여 커스텀 메트릭을 수집하고 Grafana에서 시각화할 수 있다. 각 서비스는 `lionpay.{service_name}` 형식의 통일된 네이밍 컨벤션을 사용한다.

---

### lionpay-auth (Java/Spring Boot)

#### 커스텀 메트릭 사용 예제

**Counter (카운터)** - 로그인 성공/실패 횟수 등:

```java
@Service
public class AuthService {
    private final LongCounter loginCounter;

    public AuthService(Meter meter) {
        this.loginCounter = meter.counterBuilder("auth.login.count")
            .setDescription("로그인 시도 횟수")
            .setUnit("1")
            .build();
    }

    public void login(String username) {
        // 로그인 로직
        loginCounter.add(1, Attributes.of(
            AttributeKey.stringKey("result"), "success",
            AttributeKey.stringKey("method"), "password"
        ));
    }
}
```

**Histogram (히스토그램)** - 응답 시간 분포 등:

```java
@Service
public class TokenService {
    private final DoubleHistogram tokenGenerationTime;

    public TokenService(Meter meter) {
        this.tokenGenerationTime = meter.histogramBuilder("auth.token.generation_time")
            .setDescription("JWT 토큰 생성 소요 시간")
            .setUnit("ms")
            .build();
    }

    public String generateToken(User user) {
        long startTime = System.currentTimeMillis();
        String token = createJwtToken(user);
        long duration = System.currentTimeMillis() - startTime;

        tokenGenerationTime.record(duration, Attributes.of(
            AttributeKey.stringKey("token_type"), "access"
        ));
        return token;
    }
}
```

**Gauge (게이지)** - 현재 활성 세션 수 등:

```java
@Component
public class SessionMetrics {
    private final AtomicLong activeSessions = new AtomicLong(0);

    public SessionMetrics(Meter meter) {
        meter.gaugeBuilder("auth.sessions.active")
            .setDescription("현재 활성 세션 수")
            .setUnit("1")
            .buildWithCallback(measurement ->
                measurement.record(activeSessions.get())
            );
    }

    public void sessionCreated() { activeSessions.incrementAndGet(); }
    public void sessionDestroyed() { activeSessions.decrementAndGet(); }
}
```

---

### lionpay-wallet (.NET/ASP.NET Core)

#### Wallet 설정

`aspire-servicedefaults/Extensions.cs`에서 `lionpay.wallet` 미터가 등록되어 있다:

```csharp
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddMeter("lionpay.wallet");  // 커스텀 미터 등록
    });
```

#### Wallet 커스텀 메트릭 사용 예제

먼저 서비스 클래스에서 `Meter`를 생성하고 메트릭을 정의한다:

**Counter (카운터)** - 트랜잭션 수 등:

```csharp
using System.Diagnostics.Metrics;

public class TransactionService
{
    private static readonly Meter Meter = new("lionpay.wallet", "1.0.0");
    private static readonly Counter<long> TransactionCounter =
        Meter.CreateCounter<long>(
            "wallet.transactions.count",
            unit: "1",
            description: "총 트랜잭션 수");

    public async Task<Transaction> ProcessTransactionAsync(decimal amount, string type)
    {
        // 트랜잭션 처리 로직
        var transaction = await ExecuteTransactionAsync(amount);

        TransactionCounter.Add(1,
            new KeyValuePair<string, object?>("type", type),
            new KeyValuePair<string, object?>("status", "success"));

        return transaction;
    }
}
```

**Histogram (히스토그램)** - 처리 시간 분포:

```csharp
public class WalletService
{
    private static readonly Meter Meter = new("lionpay.wallet", "1.0.0");
    private static readonly Histogram<double> ProcessingTime =
        Meter.CreateHistogram<double>(
            "wallet.processing.duration",
            unit: "ms",
            description: "지갑 작업 처리 시간");

    public async Task<Balance> GetBalanceAsync(string userId)
    {
        var stopwatch = Stopwatch.StartNew();

        var balance = await FetchBalanceAsync(userId);

        stopwatch.Stop();
        ProcessingTime.Record(stopwatch.ElapsedMilliseconds,
            new KeyValuePair<string, object?>("operation", "get_balance"));

        return balance;
    }
}
```

**Gauge (게이지)** - 현재 총 잔액:

```csharp
public class BalanceMetrics
{
    private static readonly Meter Meter = new("lionpay.wallet", "1.0.0");

    public BalanceMetrics()
    {
        Meter.CreateObservableGauge(
            "wallet.total_balance",
            () => GetTotalBalance(),
            unit: "KRW",
            description: "전체 사용자 총 잔액");
    }

    private Measurement<decimal> GetTotalBalance()
    {
        // DB에서 총 잔액 조회
        return new Measurement<decimal>(totalBalance);
    }
}
```

---

### Grafana에서 메트릭 조회

1. **Grafana 접속**: `http://localhost:3000`
2. **Explore 페이지** 이동
3. **Prometheus (Mimir)** 데이터소스 선택
4. 메트릭 쿼리 예제:
   * 로그인 횟수: `auth_login_count_total`
   * 지갑 트랜잭션: `wallet_transactions_count_total`
   * JWT 생성 시간 분포: `auth_token_generation_time_bucket`

> [!NOTE]
> OpenTelemetry 메트릭은 Prometheus 형식으로 변환될 때 `.`이 `_`로 변경된다.
> 예: `auth.login.count` → `auth_login_count_total`

---

### LGTM 스택 접속 정보

| 서비스 | URL | 설명 |
|--------|-----|------|
| **Grafana** | <http://localhost:3000> | 대시보드 (로그인 불필요) |
| **Alloy UI** | <http://localhost:13345> | OTEL 수집기 상태 |
| **Mimir** | <http://localhost:9009> | 메트릭 저장소 |
| **Loki** | <http://localhost:3100> | 로그 저장소 |
| **Tempo** | <http://localhost:3200> | 트레이스 저장소 |

---

## CI/CD 시크릿 설정 (CI/CD Secrets)

GitHub Actions를 통한 자동 배포를 위해 저장소 설정(`Settings > Secrets and variables > Actions`)에 다음 시크릿들을 등록해야 한다.

### 공통 시크릿 (Common Secrets)

모든 배포 파이프라인에서 공통으로 사용되는 AWS 인증 정보이다.

| Secret Name | 설명 |
|-------------|------|
| `AWS_ACCESS_KEY_ID` | Terraform 등을 통해 생성된 CI/CD용 IAM User의 Access Key |
| `AWS_SECRET_ACCESS_KEY` | Terraform 등을 통해 생성된 CI/CD용 IAM User의 Secret Key |
| `AWS_ACCOUNT_ID` | AWS 계정 12자리 숫자 ID (ECR 로그인 등에 사용) |

### 프론트엔드 배포 시크릿 (Frontend Distribution)

각 프론트엔드 애플리케이션의 CloudFront 캐시 무효화(Invalidation)에 사용된다.

| Secret Name | 대상 앱 | 설명 |
|-------------|---------|------|
| `CLOUDFRONT_DISTRIBUTION_ID_APP` | **lionpay-app** | 고객용 앱의 CloudFront Distribution ID |
| `CLOUDFRONT_DISTRIBUTION_ID_MANAGEMENT` | **lionpay-management** | 관리자용 앱의 CloudFront Distribution ID |

> **참고**: `check.yml` (CI 빌드/테스트) 워크플로우는 소스 코드만 필요하므로 별도의 시크릿이 필요 없다.
