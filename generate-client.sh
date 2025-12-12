#!/bin/bash

echo "[1/3] Building Auth Service..."
cd lionpay-auth
./gradlew build -x test -q
if [ $? -ne 0 ]; then
    echo "Gradle build failed."
    exit 1
fi
cd ..

echo "[2/3] Building Wallet Service..."
dotnet build ./lionpay-wallet/LionPay.Wallet.csproj --nologo --verbosity quiet
if [ $? -ne 0 ]; then
    echo "Dotnet build failed."
    exit 1
fi

echo "[3/3] Generating API Clients..."

# Define paths
AUTH_SPEC="lionpay-auth/build/docs/lionpay-auth.json"
WALLET_SPEC="lionpay-wallet/obj/lionpay-wallet.json"

APP_AUTH_OUT="lionpay-app/src/generated-api/auth"
APP_WALLET_OUT="lionpay-app/src/generated-api/wallet"
MGMT_AUTH_OUT="lionpay-management/src/generated-api/auth"
MGMT_WALLET_OUT="lionpay-management/src/generated-api/wallet"

# Generate for LionPay App
echo "Generating lionpay-auth client for lionpay-app..."
npx @openapitools/openapi-generator-cli generate -i "$AUTH_SPEC" -g typescript-axios -o "$APP_AUTH_OUT" --additional-properties=useSingleRequestParameter=true > /dev/null

echo "Generating lionpay-wallet client for lionpay-app..."
npx @openapitools/openapi-generator-cli generate -i "$WALLET_SPEC" -g typescript-axios -o "$APP_WALLET_OUT" --additional-properties=useSingleRequestParameter=true > /dev/null

# Generate for LionPay Management
echo "Generating lionpay-auth client for lionpay-management..."
npx @openapitools/openapi-generator-cli generate -i "$AUTH_SPEC" -g typescript-axios -o "$MGMT_AUTH_OUT" --additional-properties=useSingleRequestParameter=true > /dev/null

echo "Generating lionpay-wallet client for lionpay-management..."
npx @openapitools/openapi-generator-cli generate -i "$WALLET_SPEC" -g typescript-axios -o "$MGMT_WALLET_OUT" --additional-properties=useSingleRequestParameter=true > /dev/null

echo "Done."
