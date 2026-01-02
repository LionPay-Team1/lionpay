using Amazon;
using Amazon.DSQL.Util;
using Amazon.Runtime.Credentials;
using LionPay.Wallet.Options;
using Npgsql;

namespace LionPay.Wallet.Extensions;

public static class DsqlAuthenticationExtensions
{
    public static void AddDsqlNpgsqlDataSource(this IHostApplicationBuilder builder, string connectionName)
    {
        var dsqlOptions = builder.Configuration.GetSection(DsqlOptions.SectionName).Get<DsqlOptions>() ?? new DsqlOptions();

        builder.AddNpgsqlDataSource(connectionName, settings =>
        {
            settings.DisableHealthChecks = true;
        }, configureDataSourceBuilder: dataSourceBuilder =>
        {
            var connBuilder = dataSourceBuilder.ConnectionStringBuilder;

            // DSQL 엔드포인트인지 확인 (dsql 도메인 포함 여부)
            if (connBuilder.Host != null && connBuilder.Host.Contains("dsql"))
            {
                // [Fix] DSQL은 DISCARD ALL 명령을 지원하지 않으므로 커넥션 반환 시 세션 초기화를 비활성화함
                // connBuilder.NoResetOnClose = true;
                dataSourceBuilder.ConnectionStringBuilder.NoResetOnClose = true;

                // 토큰 갱신 주기 설정
                dataSourceBuilder.UsePeriodicPasswordProvider(async (_, ct) =>
                {
                    var currentHost = new NpgsqlConnectionStringBuilder(dataSourceBuilder.ConnectionString).Host;
                    if (string.IsNullOrEmpty(currentHost)) return "";

                    var token = await GenerateToken(currentHost, dsqlOptions.Region);
                    await Task.Delay(TimeSpan.FromSeconds(10), ct);
                    return token;
                }, TimeSpan.FromMinutes(dsqlOptions.TokenRefreshMinutes), TimeSpan.FromSeconds(10));
            }
        });
    }

    private static async Task<string> GenerateToken(string endpoint, string region)
    {
        var regionEndpoint = RegionEndpoint.GetBySystemName(region);

        // AWS 자격 증명 가져오기 (기본 체인 사용)
        var credentials = await DefaultAWSCredentialsIdentityResolver.GetCredentialsAsync();

        // 토큰 생성 (Admin 권한 토큰 사용)
        return await DSQLAuthTokenGenerator.GenerateDbConnectAdminAuthTokenAsync(credentials, regionEndpoint, endpoint);
    }
}
