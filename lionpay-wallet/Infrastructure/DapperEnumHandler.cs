using System.Data;
using Dapper;

namespace LionPay.Wallet.Infrastructure;

/// <summary>
/// Generic Dapper TypeHandler that maps Enums to and from uppercase string representation in the database.
/// </summary>
/// <typeparam name="TEnum">The Enum type to handle.</typeparam>
public class DapperEnumHandler<TEnum> : SqlMapper.TypeHandler<TEnum> where TEnum : struct, Enum
{
    public override void SetValue(IDbDataParameter parameter, TEnum value)
    {
        parameter.DbType = DbType.String;
        parameter.Value = value.ToString().ToUpperInvariant();
    }

    public override TEnum Parse(object value)
    {
        return Enum.Parse<TEnum>(value.ToString()!, ignoreCase: true);
    }
}
