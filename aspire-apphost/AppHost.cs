using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var jwtSecret = builder.AddParameter("jwt-secret", secret: true);

var dynamodb = builder.AddLocalDynamoDB("dynamodb")
    .WithLifetime(ContainerLifetime.Persistent);

var postgres = builder.AddPostgres("postgres")
    .WithLifetime(ContainerLifetime.Persistent);

var walletdb = postgres.AddDatabase("walletdb");

var cache = builder.AddRedis("cache");

var authService = builder.AddSpringApp("auth-service", "../lionpay-auth",
    new JavaAppExecutableResourceOptions
    {
        ApplicationName = "build/libs/app.jar",
        Port = 8080,
        Args = [],
        JvmArgs = [],
        OtelAgentPath = "../lionpay-auth/otel-agent/lib"
    })
    .WithGradleBuild()
    .WithEnvironment(context =>
    {
        var dynamodbEndpoint = dynamodb.Resource.GetEndpoint("http");
        context.EnvironmentVariables["DYNAMODB_URL"] = dynamodbEndpoint;
    })
    .WithEnvironment("AWS_ACCESS_KEY_ID", "local")
    .WithEnvironment("AWS_SECRET_ACCESS_KEY", "local")
    .WithEnvironment("JWT_SECRET", jwtSecret);

var walletService = builder.AddProject<LionPay_Wallet>("wallet-service")
    .WithReference(cache)
    .WithReference(walletdb)
    .WithEnvironment("JWT_SECRET", jwtSecret)
    .WithHttpHealthCheck("/health");

builder.AddViteApp("frontend", "../lionpay-app")
    .WithReference(authService, "AUTH_SERVER")
    .WithReference(walletService, "WALLET_SERVER")
    .WithExternalHttpEndpoints();

builder.Build().Run();
