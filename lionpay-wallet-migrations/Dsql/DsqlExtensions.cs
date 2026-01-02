using System.Data;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using DbUp;
using DbUp.Builder;
using DbUp.Engine.Output;
using DbUp.Engine.Transactions;
using DbUp.Postgresql;
using Npgsql;

namespace LionPay.Wallet.Migrations.Dsql;

public static partial class DsqlExtensions
{
    [GeneratedRegex(@"(?i)Search\s?Path=([^;]+)")]
    private static partial Regex SearchPathRegex();

    /// <summary>
    /// Get connection string use parameter SearchPath for defaultSchema
    /// </summary>
    /// <param name="connectionString">DSQL database connection string.</param>
    private static string? GetDefaultSchemaByConnectionString(string connectionString)
    {
        var match = SearchPathRegex().Match(connectionString);
        return match.Success ? match.Groups[1].Value : null;
    }

    /// <param name="supported">Fluent helper type.</param>
    extension(SupportedDatabases supported)
    {
        /// <summary>
        /// Creates an upgrader for DSQL databases.
        /// </summary>
        /// <param name="connectionString">DSQL database connection string.</param>
        /// <param name="schema">The schema in which to check for changes</param>
        /// <returns>
        /// A builder for a database upgrader designed for DSQL databases.
        /// </returns>
        private UpgradeEngineBuilder DsqlDatabase(string connectionString, string schema)
        {
            return DsqlDatabase(new PostgresqlConnectionManager(connectionString), schema);
        }

        /// <summary>
        /// Creates an upgrader for DSQL databases that use SSL.
        /// </summary>
        /// <param name="connectionString">DSQL database connection string.</param>
        /// <param name="schema">The schema in which to check for changes</param>
        /// <param name="certificate">Certificate for securing connection.</param>
        /// <returns>
        /// A builder for a database upgrader designed for DSQL databases.
        /// </returns>
        private UpgradeEngineBuilder DsqlDatabase(string connectionString, string schema, X509Certificate2 certificate)
        {
            return DsqlDatabase(new PostgresqlConnectionManager(connectionString, certificate), schema);
        }

        /// <summary>
        /// Creates an upgrader for DSQL databases that use SSL.
        /// </summary>
        /// <param name="connectionString">DSQL database connection string.</param>
        /// <param name="schema">The schema in which to check for changes</param>
        /// <param name="connectionOptions">Connection options to set SSL parameters</param>
        /// <returns>
        /// A builder for a database upgrader designed for DSQL databases.
        /// </returns>
        public UpgradeEngineBuilder DsqlDatabase(string connectionString, string schema, PostgresqlConnectionOptions connectionOptions)
        {
            return DsqlDatabase(new PostgresqlConnectionManager(connectionString, connectionOptions), schema);
        }

        /// <summary>
        /// Creates an upgrader for DSQL databases.
        /// </summary>
        /// <param name="connectionManager">The <see cref="PostgresqlConnectionManager"/> to be used during a database upgrade.</param>
        /// <returns>
        /// A builder for a database upgrader designed for DSQL databases.
        /// </returns>
        public UpgradeEngineBuilder DsqlDatabase(IConnectionManager connectionManager)
        {
            return DsqlDatabase(connectionManager);
        }

        /// <summary>
        /// Creates an upgrader for DSQL databases.
        /// </summary>
        /// <param name="connectionString">DSQL database connection string.</param>
        /// <returns>
        /// A builder for a database upgrader designed for DSQL databases.
        /// </returns>
        public UpgradeEngineBuilder DsqlDatabase(string connectionString)
        {
            return supported.DsqlDatabase(connectionString, GetDefaultSchemaByConnectionString(connectionString)!);
        }
    }

    /// <summary>
    /// Creates an upgrader for DSQL databases.
    /// </summary>
    /// <param name="connectionManager">The <see cref="PostgresqlConnectionManager"/> to be used during a database upgrade.</param>
    /// <returns>
    /// A builder for a database upgrader designed for DSQL databases.
    /// </returns>
    public static UpgradeEngineBuilder DsqlDatabase(IConnectionManager connectionManager)
    {
        return DsqlDatabase(connectionManager, null);
    }

    /// <summary>
    /// Creates an upgrader for DSQL databases.
    /// </summary>
    /// <param name="connectionManager">The <see cref="PostgresqlConnectionManager"/> to be used during a database upgrade.</param>
    /// <param name="schema">The schema in which to check for changes</param>
    /// <returns>
    /// A builder for a database upgrader designed for DSQL databases.
    /// </returns>
    public static UpgradeEngineBuilder DsqlDatabase(IConnectionManager connectionManager, string? schema)
    {
        var builder = new UpgradeEngineBuilder();
        builder.Configure(c => c.ConnectionManager = connectionManager);
        builder.Configure(c => c.ScriptExecutor = new PostgresqlScriptExecutor(
            () => c.ConnectionManager,
            () => c.Log, schema,
            () => c.VariablesEnabled,
            c.ScriptPreprocessors,
            () => c.Journal));
        builder.Configure(c => c.Journal = new DsqlTableJournal(
            () => c.ConnectionManager,
            () => c.Log,
            schema,
            "schemaversions"));
        builder.WithPreprocessor(new PostgresqlPreprocessor());
        return builder;
    }

    /// <param name="supported">Fluent helper type.</param>
    extension(SupportedDatabasesForEnsureDatabase supported)
    {
        /// <summary>
        /// Ensures that the database specified in the connection string exists.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog());
        }

        /// <summary>
        /// Ensures that the database specified in the connection string exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="certificate">Certificate for securing connection.</param>
        public void DsqlDatabase(string connectionString, X509Certificate2 certificate)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog(), certificate);
        }

        /// <summary>
        /// Ensures that the database specified in the connection string exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="connectionOptions">Connection SSL to customize SSL behaviour</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString, PostgresqlConnectionOptions connectionOptions)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog(), connectionOptions);
        }

        /// <summary>
        /// Ensures that the database specified in the connection string exists.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger)
        {
            supported.DsqlDatabase(connectionString, logger, new PostgresqlConnectionOptions());
        }

        /// <summary>
        /// Ensures that the database specified in the connection string exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <param name="certificate">Certificate for securing connection.</param>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger, X509Certificate2 certificate)
        {
            var options = new PostgresqlConnectionOptions
            {
                ClientCertificate = certificate
            };
            supported.DsqlDatabase(connectionString, logger, options);
        }

        /// <summary>
        /// Ensures that the database specified in the connection string exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <param name="connectionOptions">Connection options to set SSL parameters</param>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger, PostgresqlConnectionOptions connectionOptions)
        {
            ArgumentNullException.ThrowIfNull(supported);
            ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
            ArgumentNullException.ThrowIfNull(logger);

            var masterConnectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString);

            var databaseName = masterConnectionStringBuilder.Database;
            if (string.IsNullOrWhiteSpace(databaseName))
            {
                throw new InvalidOperationException("The connection string does not specify a database name.");
            }

            masterConnectionStringBuilder.Database = connectionOptions.MasterDatabaseName;

            var logMasterConnectionStringBuilder = new NpgsqlConnectionStringBuilder(masterConnectionStringBuilder.ConnectionString);
            if (!string.IsNullOrEmpty(logMasterConnectionStringBuilder.Password))
            {
                logMasterConnectionStringBuilder.Password = "******";
            }

            logger.LogDebug("Master ConnectionString => {0}", logMasterConnectionStringBuilder.ConnectionString);

            var factory = new DsqlConnectionFactory(masterConnectionStringBuilder.ConnectionString, connectionOptions);
            using var connection = factory.CreateConnection();
            connection.Open();

            var sqlCommandText =
                $"SELECT case WHEN oid IS NOT NULL THEN 1 ELSE 0 end FROM pg_database WHERE datname = '{databaseName}' limit 1;";

            // check to see if the database already exists..
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                var results = Convert.ToInt32(command.ExecuteScalar());

                // if the database exists, we're done here...
                if (results == 1)
                {
                    return;
                }
            }

            sqlCommandText = $"create database \"{databaseName}\";";

            // Create the database...
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                command.ExecuteNonQuery();
            }

            logger.LogInformation("Created database {0}", databaseName);
        }
    }

    /// <param name="supported">Fluent helper type.</param>
    extension(SupportedDatabasesForDropDatabase supported)
    {
        /// <summary>
        /// Drops the database specified in the connection string if it exists.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog());
        }

        /// <summary>
        /// Drops the database specified in the connection string if it exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="certificate">Certificate for securing connection.</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString, X509Certificate2 certificate)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog(), certificate);
        }

        /// <summary>
        /// Drops the database specified in the connection string if it exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="connectionOptions">Connection SSL to customize SSL behaviour</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString, PostgresqlConnectionOptions connectionOptions)
        {
            supported.DsqlDatabase(connectionString, new ConsoleUpgradeLog(), connectionOptions);
        }

        /// <summary>
        /// Drops that the database specified in the connection string if it exists.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <returns></returns>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger)
        {
            supported.DsqlDatabase(connectionString, logger, new PostgresqlConnectionOptions());
        }

        /// <summary>
        /// Drops the database specified in the connection string if it exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <param name="certificate">Certificate for securing connection.</param>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger, X509Certificate2 certificate)
        {
            var options = new PostgresqlConnectionOptions
            {
                ClientCertificate = certificate
            };
            supported.DsqlDatabase(connectionString, logger, options);
        }

        /// <summary>
        /// Drops the database specified in the connection string if it exists using SSL for the connection.
        /// </summary>
        /// <param name="connectionString">The connection string.</param>
        /// <param name="logger">The <see cref="DbUp.Engine.Output.IUpgradeLog"/> used to record actions.</param>
        /// <param name="connectionOptions">Connection options to set SSL parameters</param>
        public void DsqlDatabase(string connectionString, IUpgradeLog logger, PostgresqlConnectionOptions connectionOptions)
        {
            ArgumentNullException.ThrowIfNull(supported);
            ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
            ArgumentNullException.ThrowIfNull(logger);

            var masterConnectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString);

            var databaseName = masterConnectionStringBuilder.Database;
            if (string.IsNullOrWhiteSpace(databaseName))
            {
                throw new InvalidOperationException("The connection string does not specify a database name.");
            }

            if (databaseName == connectionOptions.MasterDatabaseName)
            {
                throw new InvalidOperationException(
                    "Database in connection string needs to be different than the master database in PostgresqlConnectionOptions.");
            }

            masterConnectionStringBuilder.Database = connectionOptions.MasterDatabaseName;
            masterConnectionStringBuilder.SearchPath = "public";

            var logMasterConnectionStringBuilder = new NpgsqlConnectionStringBuilder(masterConnectionStringBuilder.ConnectionString);
            if (!string.IsNullOrEmpty(logMasterConnectionStringBuilder.Password))
            {
                logMasterConnectionStringBuilder.Password = "******";
            }

            logger.LogDebug("Master ConnectionString => {0}", logMasterConnectionStringBuilder.ConnectionString);

            var factory = new DsqlConnectionFactory(masterConnectionStringBuilder.ConnectionString, connectionOptions);
            using var connection = factory.CreateConnection();
            connection.Open();

            var sqlCommandText =
                $"SELECT case WHEN oid IS NOT NULL THEN 1 ELSE 0 end FROM pg_database WHERE datname = '{databaseName}' limit 1;";

            // check to see if the database already exists..
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                var results = Convert.ToInt32(command.ExecuteScalar());

                // if the database does not exist, we're done here...
                if (results == 0)
                {
                    logger.LogInformation("Database {0} does not exist. Skipping delete operation.", databaseName);
                    return;
                }
            }

            // prevent new connections to the database
            sqlCommandText = $"alter database \"{databaseName}\" with ALLOW_CONNECTIONS false;";
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                command.ExecuteNonQuery();
            }

            logger.LogInformation("Stopped connections for database {0}.", databaseName);

            // terminate all existing connections to the database
            sqlCommandText =
                $"select pg_terminate_backend(pg_stat_activity.pid) from pg_stat_activity where pg_stat_activity.datname = \'{databaseName}\';";
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                command.ExecuteNonQuery();
            }

            logger.LogInformation("Closed existing connections for database {0}.", databaseName);

            sqlCommandText = $"drop database \"{databaseName}\";";

            // drop the database
            using (var command = new NpgsqlCommand(sqlCommandText, connection)
                   {
                       CommandType = CommandType.Text
                   })
            {
                command.ExecuteNonQuery();
            }

            logger.LogInformation("Dropped database {0}.", databaseName);
        }
    }

    /// <summary>
    /// Tracks the list of executed scripts in a DSQL table.
    /// </summary>
    /// <param name="builder">The builder.</param>
    /// <param name="schema">The schema.</param>
    /// <param name="table">The table.</param>
    /// <returns></returns>
    public static UpgradeEngineBuilder JournalToDsqlTable(this UpgradeEngineBuilder builder, string schema, string table)
    {
        builder.Configure(c => c.Journal = new DsqlTableJournal(() => c.ConnectionManager, () => c.Log, schema, table));
        return builder;
    }
}
