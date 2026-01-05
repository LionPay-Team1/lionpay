using System.Reflection;
using Amazon;
using Amazon.DSQL.Util;
using Amazon.Runtime;
using Amazon.Runtime.Credentials;
using CommandLine;
using DbUp;
using LionPay.Wallet.Migrations;
using LionPay.Wallet.Migrations.Dsql;

return await Parser.Default.ParseArguments<MigrateOptions, GetTokenOptions>(args)
    .MapResult(
        async (MigrateOptions options) => await RunMigrations(options),
        async (GetTokenOptions options) => await GetToken(options),
        _ => Task.FromResult(-1));

static async Task<int> GetToken(GetTokenOptions options)
{
    try
    {
        var token = await GenerateToken(options.Profile, options.Region, options.ClusterEndpoint, options.ExpiresInMinutes);

        Console.WriteLine(token);
        return 0;
    }

    catch (Exception ex)
    {
        Console.Error.WriteLine($"Error: {ex.Message}");
        return -1;
    }
}

static async Task<int> RunMigrations(MigrateOptions options)
{
    // 환경 변수에서 기본값 로드 (우선순위: 명령어 인자 > 환경 변수)
    var clusterEndpoint = options.ClusterEndpoint ?? Environment.GetEnvironmentVariable("CLUSTER_ENDPOINT");
    var region = options.Region ?? Environment.GetEnvironmentVariable("AWS_REGION");
    var profile = options.Profile ?? Environment.GetEnvironmentVariable("AWS_PROFILE");

    if (string.IsNullOrEmpty(clusterEndpoint) || string.IsNullOrEmpty(region))
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("Error: CLUSTER_ENDPOINT and AWS_REGION must be provided via command line or environment variables.");
        Console.ResetColor();
        return -1;
    }

    Console.WriteLine($"Using Cluster Endpoint: {clusterEndpoint}");
    Console.WriteLine($"Using AWS Region: {region}");
    if (!string.IsNullOrEmpty(profile))
    {
        Console.WriteLine($"Using AWS Profile: {profile}");
    }

    string connectionString;
    try
    {
        connectionString = await BuildDsqlConnectionString(profile, region, clusterEndpoint, options.Database);
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Error building DSQL connection string: {ex.Message}");
        Console.ResetColor();
        return -1;
    }

    // 토큰 발급 후 바로 연결하면 연결이 되지 않기 때문에 30초간 대기
    Console.WriteLine("Waiting for 30 seconds before connecting...");
    await Task.Delay(TimeSpan.FromSeconds(30));

    try
    {
        // Ensure the database exists
        EnsureDatabase.For.PostgresqlDatabase(connectionString);

        var upgrader = DeployChanges.To
            .DsqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
            .WithoutTransaction()
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(result.Error);
            Console.ResetColor();
            return -1;
        }

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("Success!");
        Console.ResetColor();
        return 0;
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Migration failed: {ex.Message}");
        Console.ResetColor();
        return -1;
    }
}

static async Task<string> BuildDsqlConnectionString(string? profile, string region, string clusterEndpoint, string database)
{
    var token = await GenerateToken(profile, region, clusterEndpoint);
    var builder = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = clusterEndpoint,
        Database = database,
        Username = "admin",
        Password = token,
        Pooling = false,
        Timeout = 30,
        SslMode = Npgsql.SslMode.Require,
        IncludeErrorDetail = true
    };

    return builder.ToString();
}

static async Task<string> GenerateToken(string? profile, string region, string clusterEndpoint, int expiresInMinutes = 15)
{
    var regionEndpoint = RegionEndpoint.GetBySystemName(region);

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
        credentials.Expiration = DateTime.UtcNow.AddMinutes(expiresInMinutes);
    }

    return await DSQLAuthTokenGenerator.GenerateDbConnectAdminAuthTokenAsync(credentials, regionEndpoint, clusterEndpoint);
}
