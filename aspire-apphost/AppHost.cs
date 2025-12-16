using LionPay.AppHost;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var jwtSecret = builder.AddParameter("jwt-secret", secret: true);

var dynamodb = builder.AddLocalDynamoDb("dynamodb");

var walletPostgres = builder.AddPostgres("wallet-postgres");
var walletdb = walletPostgres.AddDatabase("walletdb");

var authService = builder.AddSpringApp("auth-service", "../lionpay-auth",
        new JavaAppExecutableResourceOptions
        {
            ApplicationName = "build/libs/app.jar",
            Port = 5172,
            Args = [],
            JvmArgs = [],
            OtelAgentPath = "../lionpay-auth/otel-agent/lib"
        })
    .WithReference(dynamodb)
    .WaitFor(dynamodb)
    .WithGradleBuild()
    .WithEnvironment("DYNAMODB_URL", dynamodb.GetEndpoint("http"))
    .WithEnvironment("AWS_ACCESS_KEY_ID", "local")
    .WithEnvironment("AWS_SECRET_ACCESS_KEY", "local")
    .WithEnvironment("JWT_SECRET", jwtSecret)
    .WithUrls(c =>
    {
        var item = new ResourceUrlAnnotation
        {
            Url = $"{c.Urls.First().Url}/swagger.html",
            DisplayText = "Swagger"
        };
        c.Urls.Add(item);
    });

var walletDbMigrations = builder.AddProject<LionPay_Wallet_Migrations>("wallet-db-migrations")
    .WaitFor(walletdb)
    .WithReference(walletdb);

var walletCache = builder.AddRedis("wallet-cache");

var walletService = builder.AddProject<LionPay_Wallet>("wallet-service")
    .WaitForCompletion(walletDbMigrations)
    .WithReference(walletCache)
    .WithReference(walletdb)
    .WithReference(walletdb)
    .WithEnvironment("JWT__Secret", jwtSecret)
    .WithEnvironment("JWT__Issuer", "lionpay-auth")
    .WithEnvironment("JWT__Audiences", "lionpay-app,lionpay-management")
    .WithHttpHealthCheck("/health")
    .WithUrls(c =>
    {
        var item = new ResourceUrlAnnotation
        {
            Url = $"{c.Urls.First().Url}/scalar",
            DisplayText = "Scalar"
        };
        c.Urls.Add(item);
    });

builder.AddBunApp("app", "../lionpay-app", "dev", watch: true)
    .WithBunPackageInstallation()
    .WithReference(authService)
    .WithEnvironment("AUTH_SERVICE_URL", authService.GetEndpoint("http"))
    .WithReference(walletService)
    .WithEnvironment("WALLET_SERVICE_URL", walletService.GetEndpoint("http"))
    .WithHttpEndpoint(port: 5173, env: "PORT");

builder.AddBunApp("management", "../lionpay-management", "dev", watch: true)
    .WithBunPackageInstallation()
    .WithReference(authService)
    .WithEnvironment("AUTH_SERVICE_URL", authService.GetEndpoint("http"))
    .WithReference(walletService)
    .WithEnvironment("WALLET_SERVICE_URL", walletService.GetEndpoint("http"))
    .WithHttpEndpoint(port: 5174, env: "PORT");

builder.Build().Run();
