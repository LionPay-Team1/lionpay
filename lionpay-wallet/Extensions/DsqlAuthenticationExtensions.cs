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

        builder.AddNpgsqlDataSource(connectionName, configureDataSourceBuilder: dataSourceBuilder =>
        {
            // 토큰 갱신 주기 설정
            dataSourceBuilder.UsePeriodicPasswordProvider(async (_, ct) =>
            {
                // 재연결 시 호스트 정보가 변경되었을 가능성은 낮지만 안전하게 확인
                var currentHost = new NpgsqlConnectionStringBuilder(dataSourceBuilder.ConnectionString).Host;
                if (string.IsNullOrEmpty(currentHost)) return "";

                return await GenerateToken(currentHost, dsqlOptions.Region);
            }, TimeSpan.FromMinutes(dsqlOptions.TokenRefreshMinutes), TimeSpan.FromSeconds(10));
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
