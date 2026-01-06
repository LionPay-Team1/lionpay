using Amazon;
using LionPay.AppHost;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

var awsConfig = builder.AddAWSSDKConfig()
    .WithRegion(RegionEndpoint.APNortheast2)
    .WithProfile("likelion431");

var awsResources = builder
    .AddAWSCloudFormationTemplate("aws-resources", "app-resources.template", stackName: "lionpay-local-dev")
    .WithReference(awsConfig);

var jwtSecret = builder.AddParameter("jwt-secret", secret: true);

var authService = builder.AddSpringApp("auth-service", "../lionpay-auth",
        new JavaAppExecutableResourceOptions
        {
            ApplicationName = "build/libs/app.jar",
            Port = 5172,
            Args = [],
            JvmArgs = [],
            OtelAgentPath = "../lionpay-auth/otel-agent/lib"
        })
    .WaitFor(awsResources)
    .WithReference(awsResources)
    .WithGradleBuild()
    .WithEnvironment("DYNAMODB_TABLE_NAME", awsResources.GetOutput("AuthDbTableName"))
    .WithEnvironment("AWS_REGION", awsConfig.Region!.SystemName)
    .WithEnvironment("AWS_PROFILE", awsConfig.Profile)
    .WithEnvironment("JWT_SECRET", jwtSecret)
    .WithHttpHealthCheck("/actuator/health")
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
    .WaitFor(awsResources)
    .WithReference(awsResources)
    .WithEnvironment("CLUSTER_ENDPOINT", awsResources.GetOutput("WalletDbClusterEndpoint"))
    .WithEnvironment("AWS_REGION", awsConfig.Region!.SystemName)
    .WithEnvironment("AWS_PROFILE", awsConfig.Profile);

var walletService = builder.AddProject<LionPay_Wallet>("wallet-service")
    .WaitFor(awsResources)
    .WaitForCompletion(walletDbMigrations)
    .WithReference(awsResources)
    .WithEnvironment("JWT_SECRET", jwtSecret)
    .WithEnvironment("JWT_ISSUER", "lionpay-auth")
    .WithEnvironment("JWT_AUDIENCES", "lionpay-app,lionpay-management")
    .WithEnvironment("WALLETDB_CLUSTER_ENDPOINT", awsResources.GetOutput("WalletDbClusterEndpoint"))
    .WithEnvironment("AWS_PROFILE", awsConfig.Profile)
    .WithEnvironment("AWS_REGION", awsConfig.Region!.SystemName)
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
