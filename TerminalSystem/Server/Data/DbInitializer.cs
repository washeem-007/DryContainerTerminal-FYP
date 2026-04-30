using Server.Models;

namespace Server.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                string Hash(string pw) =>
                    BitConverter.ToString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(pw)))
                                .Replace("-", "").ToLower();

                var personnel = new[]
                {
                    new User { Username = "washeem",  PasswordHash = Hash("washeem123"),  Role = "Admin" },
                    new User { Username = "Lesly",    PasswordHash = Hash("Lesly123"),    Role = "Wharf Clerk" },
                    new User { Username = "Alice",    PasswordHash = Hash("Alice123"),    Role = "Wharf Clerk" },
                    new User { Username = "Harley",   PasswordHash = Hash("Harley123"),   Role = "Wharf Clerk" },
                    new User { Username = "Beatrix",  PasswordHash = Hash("Beatrix123"),  Role = "Yard Supervisor" },
                    new User { Username = "Cho",      PasswordHash = Hash("Cho123"),      Role = "Yard Supervisor" },
                    new User { Username = "Rigsby",   PasswordHash = Hash("Rigsby123"),   Role = "Gate Clerk" },
                    new User { Username = "Patrick",  PasswordHash = Hash("Patrick123"),  Role = "Gate Clerk" },
                };

                foreach (var person in personnel)
                {
                    if (!context.Users.Any(u => u.Username == person.Username))
                        context.Users.Add(person);
                }
                context.SaveChanges();
            }

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
                    BayNumber = i + 6, // Offseting the numbers
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

            context.SaveChanges();
        }
    }
}
