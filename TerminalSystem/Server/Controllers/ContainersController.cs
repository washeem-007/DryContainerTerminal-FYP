using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContainersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IYardService _yardService;

        public ContainersController(ApplicationDbContext context, IYardService yardService)
        {
            _context = context;
            _yardService = yardService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Container>>> GetAll()
        {
            return await _context.Containers
                .Include(c => c.CurrentLocation)
                .Include(c => c.Inspections)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Container>> GetContainer(string id)
        {
            var container = await _context.Containers
                .Include(c => c.CurrentLocation)
                .Include(c => c.Inspections)
                .FirstOrDefaultAsync(c => c.ContainerId == id);

            if (container == null) return NotFound();
            return container;
        }

        [HttpGet("wharf-dashboard")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<WharfDashboardDTO>>> GetWharfDashboard()
        {
            var currentUser = User.Identity?.Name;
            var isWharfClerk = User.IsInRole("Wharf Clerk");

            var query = _context.Containers
                .Where(c => !c.IsCleared)
                .Include(c => c.CurrentLocation)
                .Include(c => c.Inspections)
                .AsQueryable();

            if (isWharfClerk)
            {
                query = query.Where(c => c.AssignedWharfClerk == currentUser);
            }

            var containers = await query.ToListAsync();

            var dtos = containers.Select(c =>
            {
                var latestInspection = c.Inspections.OrderByDescending(i => i.InspectedAt).FirstOrDefault();
                
                string status = "Awaiting Inspection";
                if (latestInspection != null)
                {
                    status = latestInspection.Result == "Pass" ? "Passed" : 
                             latestInspection.Result == "Fail" ? "Failed" : "Pending";
                }
                
                string locationStr = "Transit/Unknown";
                if (c.CurrentLocation != null)
                {
                    if (c.CurrentLocation is Bay b)
                    {
                        locationStr = $"Bay {b.BayNumber}";
                    }
                    else if (c.CurrentLocation is Stack s)
                    {
                        locationStr = $"Stack {s.StackLetter}, Tier {s.CurrentTier}";
                    }
                }

                int daysInTerminal = (DateTime.Now - c.ArrivalTime).Days;
                if (daysInTerminal < 0) daysInTerminal = 0;

                decimal baseFee = 50.00m;
                decimal addCharges = latestInspection?.AdditionalCharges ?? 0m;
                decimal total = baseFee + addCharges;

                return new WharfDashboardDTO
                {
                    ContainerId = c.ContainerId,
                    Status = status,
                    Location = locationStr,
                    DaysInTerminal = daysInTerminal,
                    Shipper = string.IsNullOrEmpty(c.Shipper) ? "Unknown" : c.Shipper,
                    Type = c.Type,
                    TotalDue = $"${total:F2}"
                };
            }).ToList();

            return Ok(dtos);
        }

        [HttpPost]
        public async Task<ActionResult<Container>> Register(Container container)
        {
            // Security: Prevent premature clearance from legacy frontend clients
            container.IsCleared = false;

            // Call YardService to decide location
            await _yardService.DecideStorageLocationAsync(container);

            var existing = await _context.Containers.FindAsync(container.ContainerId);
            if (existing != null)
            {
                // Update properties
                existing.VehicleNumber = container.VehicleNumber;
                existing.Type = container.Type;
                existing.OriginPort = container.OriginPort;
                existing.Shipper = container.Shipper;
                existing.CurrentStatus = container.CurrentStatus;
                existing.IsCleared = container.IsCleared; 
                existing.HasWeightSlip = container.HasWeightSlip;
                existing.ArrivalTime = container.ArrivalTime;

                if (container.CurrentLocationId.HasValue)
                {
                    existing.CurrentLocationId = container.CurrentLocationId;
                }
                
                _context.Containers.Update(existing);
            }
            else
            {
                _context.Containers.Add(container);
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetContainer), new { id = container.ContainerId }, container);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Container container)
        {
            if (id != container.ContainerId) return BadRequest();
            _context.Entry(container).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!ContainerExists(id)) return NotFound(); else throw; }
            return NoContent();
        }

        [HttpPost("{id}/pay")]
        public async Task<IActionResult> ProcessPayment(string id)
        {
            var container = await _context.Containers.FindAsync(id);
            if (container == null) return NotFound();

            // Lock payment clearance completely natively
            container.IsCleared = true;
            container.CurrentStatus = "Paid/Exiting";

            // Free the storage yard
            if (container.CurrentLocationId.HasValue)
            {
                var loc = await _context.YardLocations.FindAsync(container.CurrentLocationId);
                if (loc != null) loc.IsOccupied = false;
                container.CurrentLocationId = null;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var container = await _context.Containers.FindAsync(id);
            if (container == null) return NotFound();
            _context.Containers.Remove(container);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ContainerExists(string id) => _context.Containers.Any(e => e.ContainerId == id);
    }
}
