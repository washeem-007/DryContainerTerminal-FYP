using Server.Models;

namespace Server.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Look for any yard locations.
            if (context.YardLocations.Any())
            {
                return;   // DB has been seeded
            }

            var bays = new List<Bay>();

            // Create 6 Weigh Bays (W1 to W6)
            for (int i = 1; i <= 6; i++)
            {
                bays.Add(new Bay
                {
                    LocationName = $"W{i}",
                    IsOccupied = false,
                    CapacityTier = 1,
                    BayNumber = i,
                    BayType = "Weigh",
                    IsGreenLane = false
                });
            }

            // Create 10 Inspection Bays (I1 to I10)
            for (int i = 1; i <= 10; i++)
            {
                bays.Add(new Bay
                {
                    LocationName = $"I{i}",
                    IsOccupied = false,
                    CapacityTier = 1,
                    BayNumber = i + 6, // Offset numbers to prevent unique constraint issues if any
                    BayType = "Inspection",
                    IsGreenLane = i <= 5 // First 5 inspection bays could be green lane? Adjust as needed
                });
            }
            context.Bays.AddRange(bays);

            var stacks = new Stack[]
            {
                new Stack { LocationName = "A", IsOccupied = false, CapacityTier = 3, StackLetter = "A", CurrentTier = 0 },
                new Stack { LocationName = "B", IsOccupied = false, CapacityTier = 3, StackLetter = "B", CurrentTier = 0 },
                new Stack { LocationName = "C", IsOccupied = false, CapacityTier = 3, StackLetter = "C", CurrentTier = 0 },
                new Stack { LocationName = "D", IsOccupied = false, CapacityTier = 3, StackLetter = "D", CurrentTier = 0 },
                new Stack { LocationName = "E", IsOccupied = false, CapacityTier = 3, StackLetter = "E", CurrentTier = 0 },
            };
            context.Stacks.AddRange(stacks);

            // Seed Users if none exist
            if (!context.Users.Any())
            {
                // Simple SHA256 hashing inline for the seeder
                using (var sha256 = System.Security.Cryptography.SHA256.Create())
                {
                    var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("password123"));
                    var defaultPasswordHash = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();

                    var users = new User[]
                    {
                        new User { Username = "admin", PasswordHash = defaultPasswordHash, Role = "Admin" },
                        new User { Username = "gateclerk", PasswordHash = defaultPasswordHash, Role = "Gate Clerk" },
                        new User { Username = "supervisor", PasswordHash = defaultPasswordHash, Role = "Yard Supervisor" },
                        new User { Username = "wharfclerk", PasswordHash = defaultPasswordHash, Role = "Wharf Clerk" }
                    };
                    context.Users.AddRange(users);
                }
            }

            context.SaveChanges();
        }
    }
}
