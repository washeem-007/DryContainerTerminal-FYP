using Microsoft.AspNetCore.Mvc;
using Server.Services;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YardController : ControllerBase
    {
        private readonly IYardService _yardService;

        public YardController(IYardService yardService)
        {
            _yardService = yardService;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardSummary()
        {
            return await _yardService.GetYardSummaryAsync();
        }

        [HttpGet("bays")]
        public async Task<ActionResult<IEnumerable<Bay>>> GetBays()
        {
            return Ok(await _yardService.GetBaysAsync());
        }

        [HttpPost("release/{bayNumber}")]
        public async Task<IActionResult> ReleaseBay(int bayNumber)
        {
            var result = await _yardService.ReleaseBayAsync(bayNumber);
            if (!result) return BadRequest("Bay not found or already free.");
            return Ok(new { message = $"Bay {bayNumber} released successfully." });
        }
    }
}
