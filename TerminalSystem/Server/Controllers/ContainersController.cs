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

        [HttpPost]
        public async Task<ActionResult<Container>> Register(Container container)
        {
            // Call YardService to decide location
            await _yardService.DecideStorageLocationAsync(container);

            var existing = await _context.Containers.FindAsync(container.ContainerId);
            if (existing != null)
            {
                // Update properties
                existing.VehicleNumber = container.VehicleNumber;
                existing.Type = container.Type;
                existing.OriginPort = container.OriginPort;
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
