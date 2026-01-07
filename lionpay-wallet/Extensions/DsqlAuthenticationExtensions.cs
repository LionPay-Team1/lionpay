using Amazon;
using Amazon.DSQL.Util;
using Amazon.Runtime;
using Amazon.Runtime.Credentials;
using LionPay.Wallet.Options;
using Npgsql;

namespace LionPay.Wallet.Extensions;

public static class DsqlAuthenticationExtensions
{
    /// <summary>
    /// DSQL 인증을 지원하는 Npgsql DataSource를 등록합니다.
    /// WALLETDB_CLUSTER_ENDPOINT 환경 변수에서 엔드포인트를 읽고,
    /// AWS 자격 증명을 사용하여 DSQL 토큰을 자동으로 갱신합니다.
    /// </summary>
    public static void AddDsqlNpgsqlDataSource(this IHostApplicationBuilder builder, string connectionName)
    {
        var dsqlOptions = builder.Configuration.GetSection(DsqlOptions.SectionName).Get<DsqlOptions>() ?? new DsqlOptions();
        var clusterEndpoint = builder.Configuration["WALLETDB_CLUSTER_ENDPOINT"];

        // DSQL 엔드포인트인 경우 초기 토큰을 미리 생성 (30초 대기 필요)
        string? initialToken = null;
        if (!string.IsNullOrEmpty(clusterEndpoint) && clusterEndpoint.Contains("dsql"))
        {
            initialToken = GenerateToken(clusterEndpoint, dsqlOptions.Region).GetAwaiter().GetResult();
            Thread.Sleep(TimeSpan.FromSeconds(30));
        }

        builder.AddNpgsqlDataSource(connectionName, settings =>
        {
            settings.DisableHealthChecks = true;

            if (!string.IsNullOrEmpty(clusterEndpoint))
            {
                // UsePeriodicPasswordProvider 사용 시 ConnectionString에 Password를 포함하면 안 됨
                settings.ConnectionString = $"Host={clusterEndpoint};Database=postgres;Username=admin;Ssl Mode=VerifyFull;";
            }
        }, configureDataSourceBuilder: dataSourceBuilder =>
        {
            var connBuilder = dataSourceBuilder.ConnectionStringBuilder;

            if (connBuilder.Host != null && connBuilder.Host.Contains("dsql"))
            {
                // DSQL은 DISCARD ALL 명령을 지원하지 않음
                dataSourceBuilder.ConnectionStringBuilder.NoResetOnClose = true;

                var isFirstToken = true;

                dataSourceBuilder.UsePeriodicPasswordProvider(async (_, ct) =>
                {
                    // 첫 호출 시 미리 생성한 초기 토큰 반환
                    if (isFirstToken && !string.IsNullOrEmpty(initialToken))
                    {
                        isFirstToken = false;
                        return initialToken;
                    }

                    var currentHost = new NpgsqlConnectionStringBuilder(dataSourceBuilder.ConnectionString).Host;
                    if (string.IsNullOrEmpty(currentHost)) return "";

                    var token = await GenerateToken(currentHost, dsqlOptions.Region);
                    await Task.Delay(TimeSpan.FromSeconds(30), ct);
                    return token;
                }, TimeSpan.FromMinutes(dsqlOptions.TokenRefreshMinutes), TimeSpan.FromSeconds(60));
            }
        });
    }

    private static async Task<string> GenerateToken(string endpoint, string region)
    {
        if (string.IsNullOrEmpty(region))
        {
            region = Environment.GetEnvironmentVariable("AWS_REGION") ?? "ap-northeast-2";
        }

        var regionEndpoint = RegionEndpoint.GetBySystemName(region);
        var profile = Environment.GetEnvironmentVariable("AWS_PROFILE");

        AWSCredentials credentials;
        if (!string.IsNullOrEmpty(profile))
        {
            var chain = new Amazon.Runtime.CredentialManagement.CredentialProfileStoreChain();
            if (chain.TryGetAWSCredentials(profile, out var profileCreds))
            {
                credentials = profileCreds;
            }
            else
            {
                throw new InvalidOperationException($"Could not find AWS profile '{profile}'");
            }
        }
        else
        {
            credentials = await DefaultAWSCredentialsIdentityResolver.GetCredentialsAsync();
        }

        return await DSQLAuthTokenGenerator.GenerateDbConnectAdminAuthTokenAsync(credentials, regionEndpoint, endpoint);
    }
}
