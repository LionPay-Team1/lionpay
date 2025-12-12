using System.Text;
using LionPay.Wallet.Exceptions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace LionPay.Wallet.Extensions;

public static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddWalletAuthentication(IConfiguration configuration)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtSecret = configuration["JWT:Secret"];
                    if (string.IsNullOrEmpty(jwtSecret))
                    {
                        throw new InvalidOperationException("JWT:Secret is not configured");
                    }

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        RequireExpirationTime = true,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                        ValidIssuer = configuration["JWT:Issuer"],
                        ValidAudience = configuration["JWT:Audience"]
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
            services.AddAuthorization(options =>
            {
                options.AddPolicy(Policies.UserRole, policy =>
                    policy.RequireAuthenticatedUser());

                options.AddPolicy(Policies.AdminRole, policy =>
                    policy.RequireClaim("role", "ADMIN", "SUPER_ADMIN"));
            });
            return services;
        }
    }
}
