using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Services
{
    public class YardService : IYardService
    {
        private readonly ApplicationDbContext _context;

        public YardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> DecideStorageLocationAsync(Container container)
        {
            // Scenario A: Auto-assign based on clearance
            YardLocation? assignedLocation = null;

            if (container.IsCleared)
            {
                // Assign to a Bay (e.g., Green Lane preferred)
                // Simplified Logic: Find first available Bay
                assignedLocation = await _context.Bays
                    .FirstOrDefaultAsync(b => !b.IsOccupied);
            }
            else
            {
                // Assign to a Stack
                // Simplified Logic: Find first available Stack
                assignedLocation = await _context.Stacks
                    .FirstOrDefaultAsync(s => !s.IsOccupied); // In real world, check capacity vs current tier
            }

            if (assignedLocation != null)
            {
                container.CurrentLocationId = assignedLocation.LocationId;
                assignedLocation.IsOccupied = true; // Mark as occupied (simplified)
                
                // If it's a stack, maybe increase tier? For now just mark occupied.
                if (assignedLocation is Stack stack)
                {
                    stack.CurrentTier++;
                }

                _context.Update(assignedLocation);
                // Note: The caller (Controller) should save changes to Container, but we update Location here.
                return true;
            }

            return false; // No space found
        }

        public async Task<object> GetYardSummaryAsync()
        {
            var totalBays = await _context.Bays.CountAsync();
            var occupiedBays = await _context.Bays.CountAsync(b => b.IsOccupied);
            
            var totalStacks = await _context.Stacks.CountAsync();
            var occupiedStacks = await _context.Stacks.CountAsync(s => s.IsOccupied);

            return new
            {
                Bays = new { Total = totalBays, Occupied = occupiedBays, Available = totalBays - occupiedBays },
                Stacks = new { Total = totalStacks, Occupied = occupiedStacks, Available = totalStacks - occupiedStacks }
            };
        }
    }
}
