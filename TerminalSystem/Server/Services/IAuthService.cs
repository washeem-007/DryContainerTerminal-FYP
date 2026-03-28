using Server.Models;

namespace Server.Services
{
    public interface IAuthService
    {
        string HashPassword(string password);
        User? Authenticate(string username, string password);
    }
}
