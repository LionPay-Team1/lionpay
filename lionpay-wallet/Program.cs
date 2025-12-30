using System.Text.Json.Serialization;
using LionPay.Wallet;
using LionPay.Wallet.Endpoints;
using LionPay.Wallet.Extensions;
using LionPay.Wallet.Infrastructure;
using LionPay.Wallet.Options;
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

builder.AddNpgsqlDataSource(connectionName: "walletdb");

// Configure Options
builder.Services.Configure<WalletOptions>(builder.Configuration.GetSection(WalletOptions.SectionName));

// Add Services & Repositories
builder.Services.AddScoped<IWalletRepository, WalletRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IMerchantRepository, MerchantRepository>();
builder.Services.AddScoped<IExchangeRateRepository, ExchangeRateRepository>();
builder.Services.AddScoped<ICurrencyRepository, CurrencyRepository>();

builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IMerchantService, MerchantService>();
builder.Services.AddScoped<IExchangeRateService, ExchangeRateService>();
builder.Services.AddScoped<IOccExecutionStrategy, OccExecutionStrategy>();

// Add Authentication/Authorization
builder.Services.AddWalletAuthentication(builder.Configuration);
builder.Services.AddWalletAuthorization();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        corsBuilder =>
        {
            corsBuilder.WithOrigins(
                    "https://lionpay.shop",
                    "https://admin.lionpay.shop",
                    "http://localhost:5173",
                    "http://localhost:5174"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

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

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();

app.MapWalletEndpoints();
app.MapPaymentEndpoints();
app.MapTransactionEndpoints();
app.MapMerchantEndpoints();
app.MapAdminEndpoints();
app.MapExchangeRateEndpoints();

app.Run();
