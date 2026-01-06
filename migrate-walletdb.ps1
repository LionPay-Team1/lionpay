# Run lionpay-wallet-migrations
# All arguments passed to this script will be forwarded

$ProjectDir = Join-Path $PSScriptRoot "lionpay-wallet-migrations"

# 1. 빌드 단계 (출력 억제)
Write-Host "Building project... " -NoNewline -ForegroundColor Cyan
dotnet build "$ProjectDir" -c Release -v quiet /nologo > $null

if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "OK" -ForegroundColor Green

# 2. 실행 단계 (전달받은 모든 인자 포함)
Write-Host "Running Wallet Migrations..." -ForegroundColor Cyan
if ($args.Count -gt 0) {
    dotnet run --project "$ProjectDir" -c Release --no-build -- $args
}
else {
    dotnet run --project "$ProjectDir" -c Release --no-build
}
