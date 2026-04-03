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
            YardLocation? assignedLocation = null;

            // 1. Honor PreferredBayNumber if available
            if (container.PreferredBayNumber.HasValue)
            {
                assignedLocation = await _context.Bays
                    .FirstOrDefaultAsync(b => b.BayNumber == container.PreferredBayNumber.Value && !b.IsOccupied);
            }

            // 2. Fallbacks if no preferred bay provided or it was full
            if (assignedLocation == null)
            {
                if (container.IsCleared)
                {
                    assignedLocation = await _context.Bays
                        .FirstOrDefaultAsync(b => b.BayType == "Inspection" && !b.IsOccupied);
                }
                else
                {
                    assignedLocation = await _context.Stacks
                        .FirstOrDefaultAsync(s => !s.IsOccupied); 
                }
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

        public async Task<IEnumerable<Bay>> GetBaysAsync(string? bayType = null)
        {
            var query = _context.Bays.AsQueryable();
            if (!string.IsNullOrEmpty(bayType))
            {
                query = query.Where(b => b.BayType == bayType);
            }
            return await query
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

        public async Task<bool> ReleaseStackAsync(int locationId)
        {
            var stack = await _context.Stacks.FirstOrDefaultAsync(s => s.LocationId == locationId);
            if (stack == null || !stack.IsOccupied) return false;

            stack.IsOccupied = false;
            stack.CurrentTier = 0; // reset tier if applicable
            
            var container = await _context.Containers.FirstOrDefaultAsync(c => c.CurrentLocationId == stack.LocationId);
            if (container != null)
            {
                container.CurrentLocationId = null; 
                container.CurrentStatus = "Departed"; 
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
