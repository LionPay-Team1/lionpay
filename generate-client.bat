@echo off
echo [1/3] Generating Auth OpenAPI Spec...
cd lionpay-auth
call gradlew.bat generateOpenApiDocs -q
if %ERRORLEVEL% NEQ 0 (
    echo Gradle build failed.
    exit /b %ERRORLEVEL%
)
cd ..

echo [2/3] Building Wallet Service...
dotnet build ./lionpay-wallet/LionPay.Wallet.csproj --nologo --verbosity quiet
if %ERRORLEVEL% NEQ 0 (
    echo Dotnet build failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Generating API Clients...

REM Define paths
set AUTH_SPEC=lionpay-auth/build/docs/lionpay-auth.json
set WALLET_SPEC=lionpay-wallet/obj/lionpay-wallet.json

set APP_AUTH_OUT=lionpay-app/src/generated-api/auth
set APP_WALLET_OUT=lionpay-app/src/generated-api/wallet
set MGMT_AUTH_OUT=lionpay-management/src/generated-api/auth
set MGMT_WALLET_OUT=lionpay-management/src/generated-api/wallet

REM Generate for LionPay App
echo Generating lionpay-auth client for lionpay-app...
call npx @openapitools/openapi-generator-cli generate -i %AUTH_SPEC% -g typescript-axios -o %APP_AUTH_OUT% --additional-properties=useSingleRequestParameter=true > NUL

echo Generating lionpay-wallet client for lionpay-app...
call npx @openapitools/openapi-generator-cli generate -i %WALLET_SPEC% -g typescript-axios -o %APP_WALLET_OUT% --additional-properties=useSingleRequestParameter=true > NUL

REM Generate for LionPay Management
echo Generating lionpay-auth client for lionpay-management...
call npx @openapitools/openapi-generator-cli generate -i %AUTH_SPEC% -g typescript-axios -o %MGMT_AUTH_OUT% --additional-properties=useSingleRequestParameter=true > NUL

echo Generating lionpay-wallet client for lionpay-management...
call npx @openapitools/openapi-generator-cli generate -i %WALLET_SPEC% -g typescript-axios -o %MGMT_WALLET_OUT% --additional-properties=useSingleRequestParameter=true > NUL

echo Done.
