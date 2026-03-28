using System.Security.Cryptography;
using System.Text;
using Server.Data;
using Server.Models;

namespace Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }

        public User? Authenticate(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(x => x.Username == username);
            
            if (user == null)
            {
                return null;
            }

            var hash = HashPassword(password);
            
            if (user.PasswordHash == hash)
            {
                return user;
            }

            return null;
        }
    }
}
