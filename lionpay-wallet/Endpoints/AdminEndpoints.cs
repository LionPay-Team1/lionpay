using LionPay.Wallet.Models;
using LionPay.Wallet.Repositories;
using LionPay.Wallet.Services;
using Microsoft.AspNetCore.Mvc;

namespace LionPay.Wallet.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/v1/wallet/admin")
            .RequireAuthorization(Policies.AdminRole)
            .WithTags("Admin");

        // Wallets
        group.MapGet("/wallets/{userId:guid}", GetUserWallet)
            .WithSummary("Get user wallet")
            .Produces<WalletResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound);

        group.MapPost("/wallets/{userId:guid}/adjust", AdjustBalance)
            .WithSummary("Adjust user wallet balance")
            .Produces<WalletResponse>()
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound);

        // Transactions
        group.MapGet("/transactions/{userId:guid}", GetUserTransactions)
            .WithSummary("Get user transactions")
            .Produces<IEnumerable<TransactionResponse>>();

        // Merchants
        group.MapGet("/merchants", GetMerchants)
            .WithSummary("Get all merchants")
            .WithDescription("Retrieves all merchants including inactive ones.")
            .Produces<IEnumerable<MerchantResponse>>();

        group.MapPost("/merchants", CreateMerchant)
            .WithSummary("Create merchant")
            .Produces<MerchantModel>(StatusCodes.Status201Created)
            .Produces<ErrorResponse>(StatusCodes.Status400BadRequest);

        group.MapPut("/merchants/{id:guid}", UpdateMerchant)
            .WithSummary("Update merchant")
            .Produces<MerchantModel>()
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound);

        group.MapGet("/merchants/{id:guid}", GetMerchantFull)
            .WithSummary("Get merchant full info")
            .Produces<MerchantModel>()
            .Produces<ErrorResponse>(StatusCodes.Status404NotFound);

        group.MapGet("/summary", GetSummary)
            .WithSummary("Get admin dashboard summary")
            .Produces<AdminSummaryModel>();
    }


    public static async Task<IResult> GetUserWallet(
        Guid userId,
        IWalletService walletService)
    {
        var wallet = await walletService.GetWalletByUserIdAsync(userId);
        var response = new WalletResponse(
            wallet.WalletId,
            wallet.Balance,
            wallet.WalletType,
            wallet.UpdatedAt
        );
        return Results.Ok(response);
    }

    public static async Task<IResult> AdjustBalance(
        Guid userId,
        [FromBody] AdjustBalanceRequest request,
        IWalletService walletService)
    {
        var wallet = await walletService.AdjustBalanceAsync(userId, request.Amount, request.Reason);
        var response = new WalletResponse(
            wallet.WalletId,
            wallet.Balance,
            wallet.WalletType,
            wallet.UpdatedAt
        );
        return Results.Ok(response);
    }

    public static async Task<IResult> GetUserTransactions(
        Guid userId,
        ITransactionService transactionService,
        [FromQuery] int limit = 10,
        [FromQuery] int offset = 0)
    {
        var transactions = await transactionService.GetUserHistoryAsync(userId, limit, offset);
        var response = transactions.Select(t => new TransactionResponse(
            t.TxId,
            t.MerchantId,
            t.Amount,
            t.TxType,
            t.TxStatus,
            t.MerchantName,
            t.BalanceSnapshot,
            t.Currency,
            t.OriginalAmount,
            t.CreatedAt
        ));
        return Results.Ok(response);
    }

    public static async Task<IResult> CreateMerchant(
        [FromBody] CreateMerchantRequest request,
        IMerchantService merchantService)
    {
        var merchant = await merchantService.CreateMerchantAsync(request);
        return Results.Created($"/v1/wallet/merchants/{merchant.MerchantId}", merchant);
    }

    public static async Task<IResult> UpdateMerchant(
        Guid id,
        [FromBody] UpdateMerchantRequest request,
        IMerchantService merchantService)
    {
        var merchant = await merchantService.UpdateMerchantAsync(id, request);
        return Results.Ok(merchant);
    }

    public static async Task<IResult> GetMerchantFull(Guid id, IMerchantService merchantService)
    {
        var merchant = await merchantService.GetMerchantFullInfoAsync(id);
        return Results.Ok(merchant);
    }

    public static async Task<IResult> GetMerchants(IMerchantService merchantService)
    {
        var merchants = await merchantService.GetAllMerchantsAsync();
        var response = merchants.Select(m => new MerchantResponse(
            m.MerchantId,
            m.MerchantName,
            m.CountryCode,
            m.MerchantCategory,
            m.MerchantStatus,
            m.CreatedAt
        ));
        return Results.Ok(response);
    }


    public static async Task<IResult> GetSummary(
        IWalletRepository walletRepository,
        IMerchantRepository merchantRepository,
        ITransactionRepository transactionRepository,
        ICurrencyRepository currencyRepository)
    {
        // Execute in parallel for performance
        var walletsTask = walletRepository.CountWalletsAsync();
        var merchantsTask = merchantRepository.CountMerchantsAsync();
        var transactionsTask = transactionRepository.CountTransactionsAsync();
        var currenciesTask = currencyRepository.CountActiveCurrenciesAsync();

        await Task.WhenAll(walletsTask, merchantsTask, transactionsTask, currenciesTask);

        var summary = new AdminSummaryModel(
            walletsTask.Result,
            merchantsTask.Result,
            transactionsTask.Result,
            currenciesTask.Result
        );

        return Results.Ok(summary);
    }
}

