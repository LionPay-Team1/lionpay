using System.Text;
using LionPay.Wallet.Exceptions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace LionPay.Wallet.Extensions;

public static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddWalletAuthentication(IConfiguration configuration)
        {
            JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;

                    var jwtSecret = configuration["JWT_SECRET"];
                    if (string.IsNullOrEmpty(jwtSecret))
                    {
                        throw new InvalidOperationException("JWT_SECRET is not configured");
                    }

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        RequireExpirationTime = true,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                        ValidIssuer = configuration["JWT_ISSUER"],
                        ValidAudiences = configuration["JWT_AUDIENCES"]?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? []
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnChallenge = context =>
                        {
                            // Skip the default logic to bubble up the exception to global handler
                            context.HandleResponse();
                            throw new UnauthenticatedException();
                        },
                        OnForbidden = _ => throw new PermissionDeniedException()
                    };
                });
            return services;
        }

        public IServiceCollection AddWalletAuthorization()
        {
            services.AddAuthorizationBuilder()
                .AddPolicy(Policies.UserRole, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("role", "USER");
                })
                .AddPolicy(Policies.AdminRole, policy =>
                {
                    policy.RequireAuthenticatedUser();
                    // Audience is already validated by JwtBearer middleware (ValidAudiences)
                    // Only check role claim for authorization
                    policy.RequireClaim("role", "ADMIN", "SUPER_ADMIN");
                });
            return services;
        }
    }
}
