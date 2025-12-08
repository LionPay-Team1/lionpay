using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var apiService = builder.AddProject<Projects.LionPay_Wallet>("wallet-api")
    .WithReference(cache)
    .WithHttpHealthCheck("/health");

var frontend = builder.AddViteApp("frontend", "../lionpay-app")
    .WithReference(apiService, "API_BASE_URL")
    .WithExternalHttpEndpoints();

builder.Build().Run();
