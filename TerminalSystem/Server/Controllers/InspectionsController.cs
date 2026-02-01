using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InspectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IInspectionService _inspectionService;

        public InspectionsController(ApplicationDbContext context, IInspectionService inspectionService)
        {
            _context = context;
            _inspectionService = inspectionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Inspection>>> GetHistory()
        {
            return await _context.Inspections
                .Include(i => i.Container)
                .Include(i => i.Officer)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Inspection>> Submit(Inspection inspection)
        {
            await _inspectionService.ProcessInspectionAsync(inspection);
            return CreatedAtAction(nameof(GetHistory), new { id = inspection.InspectionId }, inspection);
        }
    }
}
