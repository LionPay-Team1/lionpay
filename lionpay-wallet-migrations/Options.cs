using CommandLine;

namespace LionPay.Wallet.Migrations;

[Verb("migrate", isDefault: true, HelpText = "Run database migrations.")]
public class MigrateOptions
{
    [Option('p', "profile", Required = false, HelpText = "AWS Profile to use.")]
    public string? Profile { get; set; }

    [Option('r', "region", Required = false, HelpText = "AWS Region (e.g., ap-northeast-2).")]
    public string? Region { get; set; }

    [Option('e', "endpoint", Required = false, HelpText = "AWS DSQL Cluster Endpoint.")]
    public string? ClusterEndpoint { get; set; }

    [Option('d', "database", Required = false, Default = "postgres", HelpText = "Database name to connect to.")]
    public string Database { get; set; } = "postgres";
}

[Verb("get-token", HelpText = "Generate and print DSQL authentication token.")]
public class GetTokenOptions
{
    [Option('p', "profile", Required = false, HelpText = "AWS Profile to use.")]
    public string? Profile { get; set; }

    [Option('r', "region", Required = true, HelpText = "AWS Region (e.g., ap-northeast-2).")]
    public required string Region { get; set; }

    [Option('e', "endpoint", Required = true, HelpText = "AWS DSQL Cluster Endpoint.")]
    public required string ClusterEndpoint { get; set; }

    [Option("expires-in", Required = false, Default = 15, HelpText = "Token expiration time in minutes.")]
    public int ExpiresInMinutes { get; set; }
}
