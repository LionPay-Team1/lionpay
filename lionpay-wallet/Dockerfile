FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["lionpay-wallet/LionPay.Wallet.csproj", "lionpay-wallet/"]
COPY ["aspire-servicedefaults/LionPay.ServiceDefaults.csproj", "aspire-servicedefaults/"]
RUN dotnet restore "./lionpay-wallet/LionPay.Wallet.csproj"
COPY . .
WORKDIR "/src/lionpay-wallet"
RUN dotnet build "./LionPay.Wallet.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LionPay.Wallet.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LionPay.Wallet.dll"]
