FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["lionpay-wallet-migrations/LionPay.Wallet.Migrations.csproj", "lionpay-wallet-migrations/"]
RUN dotnet restore "./lionpay-wallet-migrations/LionPay.Wallet.Migrations.csproj"
COPY . .
WORKDIR "/src/lionpay-wallet-migrations"
RUN dotnet build "./LionPay.Wallet.Migrations.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LionPay.Wallet.Migrations.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LionPay.Wallet.Migrations.dll"]
