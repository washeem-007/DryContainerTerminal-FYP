using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Default: Must be logged in at a minimum
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("containers")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetContainers()
        {
            try
            {
                var containers = await _context.Containers
                    .Include(c => c.CurrentLocation)
                    .Include(c => c.Inspections)
                    .ToListAsync();

                var dtos = containers.Select(c =>
                {
                    var latestInspection = c.Inspections?.OrderByDescending(i => i.InspectedAt).FirstOrDefault();
                    
                    string inspectionStatus = "Active"; // Default
                    if (latestInspection != null)
                    {
                        inspectionStatus = latestInspection.Result == "Pass" ? "Active" : 
                                 latestInspection.Result == "Failed" ? "Archived" : "Active";
                    }
                    
                    string locationStr = "Transit/Unknown";
                    if (c.CurrentLocation != null)
                    {
                        if (c.CurrentLocation is Bay b) locationStr = $"Bay {b.BayNumber}";
                        else if (c.CurrentLocation is Stack s) locationStr = $"Stack {s.StackLetter}";
                    }

                    return new 
                    {
                        id = c.ContainerId,
                        type = c.Type,
                        location = locationStr,
                        inspection = c.IsArchived ? "Archived" : inspectionStatus,
                        payment = c.IsCleared ? "Paid" : "Pending",
                        exitStatus = c.CurrentStatus == "Departed" || c.IsCleared ? $"Exited {c.ArrivalTime.AddDays(2):dd/MM}" : "-",
                        isArchived = c.IsArchived
                    };
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());
            }
        }

        [HttpGet("inspections")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetInspections()
        {
            var inspectionsQuery = await _context.Inspections
                .Include(i => i.Officer)
                .ToListAsync();
            
            var inspections = inspectionsQuery.Select(i => new {
                id = i.InspectionId,
                containerId = i.ContainerId,
                inspector = i.Officer != null ? i.Officer.Username : $"Officer {i.OfficerId}",
                status = i.Result,
                date = i.InspectedAt.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(inspections);
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin, Yard Supervisor")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { 
                    id = u.UserId, 
                    name = u.Username, 
                    role = u.Role, 
                    status = "Active" // Mocking status since it doesn't exist in model
                }).ToListAsync();
            return Ok(users);
        }

        [HttpGet("yardlocations")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetYardLocations()
        {
            var locations = await _context.YardLocations.Select(l => new {
                id = l.LocationId,
                name = l.LocationName,
                type = l is Bay ? "Bay" : "Stack",
                status = l.IsOccupied ? "Occupied" : "Available"
            }).ToListAsync();
            return Ok(locations);
        }

        [HttpPut("containers/{id}/archive")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ArchiveContainer(string id)
        {
            var container = await _context.Containers.FindAsync(id);
            if (container == null) return NotFound();

            container.IsArchived = true;
            container.CurrentStatus = "Archived";
            
            if (container.CurrentLocationId.HasValue)
            {
                var location = await _context.YardLocations.FindAsync(container.CurrentLocationId);
                if (location != null)
                {
                    location.IsOccupied = false;
                }
                container.CurrentLocationId = null;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Container archived successfully." });
        }

        [HttpDelete("containers/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteContainer(string id)
        {
            try
            {
                var container = await _context.Containers.FindAsync(id);
                if (container == null) return NotFound(new { message = "Container not found." });

                // If container is occupying a yard location, better free it up first!
                if (container.CurrentLocationId.HasValue)
                {
                    var location = await _context.YardLocations.FindAsync(container.CurrentLocationId);
                    if (location != null)
                    {
                        location.IsOccupied = false;
                    }
                }

                _context.Containers.Remove(container);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Container hard deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete container. Check related records constraint.", error = ex.Message });
            }
        }
    }
}
