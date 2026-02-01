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

            var bays = new Bay[10];
            for (int i = 0; i < 10; i++)
            {
                bays[i] = new Bay
                {
                    LocationName = $"Bay {i + 1}",
                    IsOccupied = false,
                    CapacityTier = 1,
                    BayNumber = i + 1,
                    IsGreenLane = i < 5 // First 5 are Green Lane
                };
            }
            context.Bays.AddRange(bays);

            var stacks = new Stack[]
            {
                new Stack { LocationName = "Stack A", IsOccupied = false, CapacityTier = 3, StackLetter = "A", CurrentTier = 0 },
                new Stack { LocationName = "Stack B", IsOccupied = false, CapacityTier = 3, StackLetter = "B", CurrentTier = 0 },
                new Stack { LocationName = "Stack C", IsOccupied = false, CapacityTier = 3, StackLetter = "C", CurrentTier = 0 },
                new Stack { LocationName = "Stack D", IsOccupied = false, CapacityTier = 3, StackLetter = "D", CurrentTier = 0 },
                new Stack { LocationName = "Stack E", IsOccupied = false, CapacityTier = 3, StackLetter = "E", CurrentTier = 0 },
            };
            context.Stacks.AddRange(stacks);

            context.SaveChanges();
        }
    }
}
