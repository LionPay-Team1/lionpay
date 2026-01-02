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
        var token = await GenerateToken(options.Profile, options.Region, options.ClusterEndpoint);
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
    string connectionString;
    var envConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__walletdb");

    // If env var is set and NO DSQL params are provided, use env var.
    // If DSQL params are provided, they take precedence, or we should clarify.
    // Logic: If env var exists, and NO endpoint provided, use env.
    // If an endpoint is provided, use DSQL logic.
    if (!string.IsNullOrEmpty(envConnectionString) && string.IsNullOrEmpty(options.ClusterEndpoint))
    {
        Console.WriteLine("Using ConnectionStrings__walletdb from environment.");
        connectionString = envConnectionString;
    }
    else
    {
        if (string.IsNullOrEmpty(options.ClusterEndpoint) || string.IsNullOrEmpty(options.Region))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(
                "Error: ConnectionStrings__walletdb not set, and DSQL parameters (ClusterEndpoint + Region) are missing.");
            Console.ResetColor();
            return -1;
        }

        try
        {
            connectionString = await BuildDsqlConnectionString(options);
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error building DSQL connection string: {ex.Message}");
            Console.ResetColor();
            return -1;
        }
    }

    // 토큰 발급 후 바로 연결하면 연결이 되지 않기 때문에 10초간 대기
    Console.WriteLine("Waiting for 10 seconds before connecting...");
    await Task.Delay(TimeSpan.FromSeconds(10));

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

static async Task<string> BuildDsqlConnectionString(Options opts)
{
    var region = RegionEndpoint.GetBySystemName(opts.Region);

    AWSCredentials credentials;
    if (!string.IsNullOrEmpty(opts.Profile))
    {
        var chain = new Amazon.Runtime.CredentialManagement.CredentialProfileStoreChain();
        if (chain.TryGetAWSCredentials(opts.Profile, out var profileCreds))
        {
            credentials = profileCreds;
        }
        else
        {
            throw new Exception($"Could not find AWS profile '{opts.Profile}'");
        }
    }
    else
    {
        credentials = await DefaultAWSCredentialsIdentityResolver.GetCredentialsAsync();
    }

    try
    {
        var stsClient = new Amazon.SecurityToken.AmazonSecurityTokenServiceClient(credentials, region);
        var identity = await stsClient.GetCallerIdentityAsync(new Amazon.SecurityToken.Model.GetCallerIdentityRequest());
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"[AWS Identity] Account: {identity.Account}, Arn: {identity.Arn}");
        Console.ResetColor();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Could not verify AWS Identity: {ex.Message}");
    }

    var endpoint = opts.ClusterEndpoint;
    if (string.IsNullOrEmpty(endpoint))
    {
        throw new Exception("Cluster Endpoint is required.");
    }

    // Remove https:// or http:// and trailing slashes if present
    endpoint = endpoint.Replace("https://", "").Replace("http://", "").Trim('/');
    // Also remove port if present, though DSQL usually implies 5432
    if (endpoint.Contains(':'))
        endpoint = endpoint.Split(':')[0];

    Console.WriteLine($"Generating Auth Token for Endpoint: {endpoint}...");
    var token = await DSQLAuthTokenGenerator.GenerateDbConnectAdminAuthTokenAsync(credentials, region, endpoint);

    var builder = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = endpoint,
        // Port = 5432,
        Database = opts.Database,
        Username = "admin",
        Password = token,
        Pooling = false,
        Timeout = 30,
        SslMode = Npgsql.SslMode.Require,
        IncludeErrorDetail = true
    };

    return builder.ToString();
}
