using Microsoft.AspNetCore.Mvc;
using Server.Services;

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
    }
}
