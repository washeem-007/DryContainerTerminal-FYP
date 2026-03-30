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
                // Scenario A: Check if a specific bay was requested
                if (container.PreferredBayNumber.HasValue)
                {
                    assignedLocation = await _context.Bays
                        .FirstOrDefaultAsync(b => b.BayNumber == container.PreferredBayNumber.Value && !b.IsOccupied);
                }

                // If no specific bay requested OR requested bay was occupied/not found, auto-assign
                if (assignedLocation == null)
                {
                    assignedLocation = await _context.Bays
                        .FirstOrDefaultAsync(b => b.BayType == "Inspection" && !b.IsOccupied);
                }
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
            var weighBaysTotal = await _context.Bays.CountAsync(b => b.BayType == "Weigh");
            var weighBaysOccupied = await _context.Bays.CountAsync(b => b.BayType == "Weigh" && b.IsOccupied);

            var inspectionBaysTotal = await _context.Bays.CountAsync(b => b.BayType == "Inspection");
            var inspectionBaysOccupied = await _context.Bays.CountAsync(b => b.BayType == "Inspection" && b.IsOccupied);
            
            var totalStacks = await _context.Stacks.CountAsync();
            var occupiedStacks = await _context.Stacks.CountAsync(s => s.IsOccupied);

            return new
            {
                WeighBays = new { Total = weighBaysTotal, Occupied = weighBaysOccupied, Available = weighBaysTotal - weighBaysOccupied },
                InspectionBays = new { Total = inspectionBaysTotal, Occupied = inspectionBaysOccupied, Available = inspectionBaysTotal - inspectionBaysOccupied },
                Stacks = new { Total = totalStacks, Occupied = occupiedStacks, Available = totalStacks - occupiedStacks }
            };
        }

        public async Task<IEnumerable<Bay>> GetBaysAsync()
        {
            return await _context.Bays
                .Where(b => b.BayType == "Inspection")
                .OrderBy(b => b.BayNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stack>> GetStacksAsync()
        {
            return await _context.Stacks
                .OrderBy(s => s.StackLetter)
                .ToListAsync();
        }

        public async Task<bool> ReleaseBayAsync(int bayNumber)
        {
            var bay = await _context.Bays.FirstOrDefaultAsync(b => b.BayNumber == bayNumber);
            if (bay == null || !bay.IsOccupied) return false;

            bay.IsOccupied = false;
            
            // Also update any container currently in this location? 
            // For now, simpler to just free the bay. Real world would require moving the container record too.
            var container = await _context.Containers.FirstOrDefaultAsync(c => c.CurrentLocationId == bay.LocationId);
            if (container != null)
            {
                container.CurrentLocationId = null; // Remove from bay
                container.CurrentStatus = "Departed"; // Or returned to stack? Assuming Departed for this workflow.
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
