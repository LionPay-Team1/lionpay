using System.Text.Json.Serialization;
using Dapper;
using LionPay.Wallet;
using LionPay.Wallet.Endpoints;
using LionPay.Wallet.Extensions;
using LionPay.Wallet.Infrastructure;
using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using LionPay.Wallet.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Configure JSON to serialize enums as strings
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Register Dapper TypeHandlers for enums (must be before first DB usage)
SqlMapper.AddTypeHandler(new DapperEnumHandler<WalletType>());
SqlMapper.AddTypeHandler(new DapperEnumHandler<TxType>());
SqlMapper.AddTypeHandler(new DapperEnumHandler<TxStatus>());

builder.AddNpgsqlDataSource(connectionName: "walletdb");

// Add Services & Repositories
builder.Services.AddScoped<IWalletRepository, WalletRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IMerchantRepository, MerchantRepository>();

builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IMerchantService, MerchantService>();
builder.Services.AddScoped<IOccExecutionStrategy, OccExecutionStrategy>();

// Add Authentication/Authorization
builder.Services.AddWalletAuthentication(builder.Configuration);
builder.Services.AddWalletAuthorization();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => "API service is running.")
        .ExcludeFromDescription();

    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();


app.MapDefaultEndpoints();

app.MapWalletEndpoints();
app.MapPaymentEndpoints();
app.MapTransactionEndpoints();
app.MapMerchantEndpoints();
app.MapAdminEndpoints();

app.Run();
