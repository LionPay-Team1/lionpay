
using System.Security.Claims;

namespace LionPay.ServiceDefaults;

public static class ClaimsPrincipalExtensions
{
    extension(ClaimsPrincipal user)
    {
        public Guid GetUserId()
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                          ?? user.FindFirst("sub")
                          ?? throw new InvalidOperationException("User ID claim not found.");

            return Guid.Parse(idClaim.Value);
        }
    }
}
