using Microsoft.AspNetCore.Mvc;
using Server.Services;
using Server.Models;
using Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YardController : ControllerBase
    {
        private readonly IYardService _yardService;
        private readonly ApplicationDbContext _context;

        public YardController(IYardService yardService, ApplicationDbContext context)
        {
            _yardService = yardService;
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardSummary()
        {
            return await _yardService.GetYardSummaryAsync();
        }

        [HttpGet("bays")]
        public async Task<ActionResult<IEnumerable<object>>> GetBays([FromQuery] string? type = null)
        {
            var bays = await _yardService.GetBaysAsync(type);
            var containerMap = await _context.Containers
                .Where(c => c.CurrentLocationId != null && !c.IsCleared)
                .ToDictionaryAsync(c => c.CurrentLocationId.Value, c => c.ContainerId);

            var result = bays.Select(b => new
            {
                b.LocationId,
                b.LocationName,
                b.IsOccupied,
                b.CapacityTier,
                b.BayNumber,
                b.IsGreenLane,
                b.BayType,
                ContainerId = containerMap.ContainsKey(b.LocationId) ? containerMap[b.LocationId] : null
            });

            return Ok(result);
        }

        [HttpGet("stacks")]
        public async Task<ActionResult<IEnumerable<Stack>>> GetStacks()
        {
            return Ok(await _yardService.GetStacksAsync());
        }

        [HttpPost("release/{bayNumber}")]
        public async Task<IActionResult> ReleaseBay(int bayNumber)
        {
            var result = await _yardService.ReleaseBayAsync(bayNumber);
            if (!result) return BadRequest("Bay not found or already free.");
            return Ok(new { message = $"Bay {bayNumber} released successfully." });
        }

        [HttpPost("release-stack/{locationId}")]
        public async Task<IActionResult> ReleaseStack(int locationId)
        {
            var result = await _yardService.ReleaseStackAsync(locationId);
            if (!result) return BadRequest("Stack not found or already free.");
            return Ok(new { message = $"Stack {locationId} released successfully." });
        }
    }
}
