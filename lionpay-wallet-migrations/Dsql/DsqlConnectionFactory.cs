using System.Data;
using DbUp.Engine.Output;
using DbUp.Engine.Transactions;
using DbUp.Postgresql;
using Npgsql;

namespace LionPay.Wallet.Migrations.Dsql;

public class DsqlConnectionFactory : IConnectionFactory
{
    private readonly NpgsqlDataSource _dataSource;

    /// <summary>
    /// Initializes a new instance of the <see cref="DsqlConnectionFactory"/> class.
    /// </summary>
    /// <param name="connectionString">The PostgreSQL connection string used to configure the data source.</param>
    /// <param name="connectionOptions">Additional connection options including SSL certificate configuration.</param>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="connectionString"/> or <paramref name="connectionOptions"/> is null.</exception>
    /// <exception cref="ArgumentException">Thrown when <paramref name="connectionString"/> is empty.</exception>
    public DsqlConnectionFactory(string connectionString, PostgresqlConnectionOptions connectionOptions)
    {
        ArgumentException.ThrowIfNullOrEmpty(connectionString);
        ArgumentNullException.ThrowIfNull(connectionOptions);

        var builder = new NpgsqlDataSourceBuilder(connectionString);

#if NET8_0_OR_GREATER
        // Use the new SSL authentication callback API for .NET 8.0 with Npgsql 9
        if (connectionOptions.ClientCertificate != null || connectionOptions.UserCertificateValidationCallback != null)
        {
            builder.UseSslClientAuthenticationOptionsCallback(options =>
            {
                if (connectionOptions.ClientCertificate != null)
                {
                    options.ClientCertificates = new System.Security.Cryptography.X509Certificates.X509CertificateCollection
                    {
                        connectionOptions.ClientCertificate
                    };
                }

                if (connectionOptions.UserCertificateValidationCallback != null)
                {
                    options.RemoteCertificateValidationCallback = connectionOptions.UserCertificateValidationCallback;
                }
            });
        }
#else
        // Use legacy API for netstandard2.0 with Npgsql 8
        if (connectionOptions.ClientCertificate != null)
        {
            builder.UseClientCertificate(connectionOptions.ClientCertificate);
        }
        if (connectionOptions.UserCertificateValidationCallback != null)
        {
            builder.UseUserCertificateValidationCallback(connectionOptions.UserCertificateValidationCallback);
        }
#endif
        _dataSource = builder.Build();
    }

    /// <summary>
    /// Creates a new database connection using the configured data source.
    /// </summary>
    /// <param name="upgradeLog">The upgrade log for recording connection-related messages. This parameter is not used in this implementation.</param>
    /// <param name="databaseConnectionManager">The database connection manager. This parameter is not used in this implementation.</param>
    /// <returns>A new <see cref="IDbConnection"/> instance ready for use.</returns>
    /// <remarks>
    /// The returned connection is not automatically opened. The caller is responsible for opening and properly disposing of the connection.
    /// The connection benefits from the data source's connection pooling and configuration reuse.
    /// </remarks>
    public IDbConnection CreateConnection(IUpgradeLog upgradeLog, DatabaseConnectionManager databaseConnectionManager) =>
        _dataSource.CreateConnection();

    /// <summary>
    /// Creates a new database connection using the configured data source.
    /// Simpler implementation of <see cref="CreateConnection(IUpgradeLog, DatabaseConnectionManager)"/>  for internal use.
    /// </summary>
    /// <returns>A new <see cref="IDbConnection"/> instance ready for use.</returns>
    internal NpgsqlConnection CreateConnection() => _dataSource.CreateConnection();
}
