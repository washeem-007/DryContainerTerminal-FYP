using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Services
{
    public class InspectionService : IInspectionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IYardService _yardService;

        public InspectionService(ApplicationDbContext context, IYardService yardService)
        {
            _context = context;
            _yardService = yardService;
        }

        public async Task ProcessInspectionAsync(Inspection inspection)
        {
            // Save the inspection
            _context.Inspections.Add(inspection);

            // Pass/Fail Logic
            var container = await _context.Containers.FindAsync(inspection.ContainerId);
            if (container == null) return; 

            if (inspection.Result == "Fail")
            {
                if (inspection.AdditionalCharges > 0)
                {
                    var invoice = new Invoice
                    {
                        InvoiceId = Guid.NewGuid().ToString(),
                        TotalAmount = inspection.AdditionalCharges,
                        IsPaid = false,
                        Inspection = inspection
                    };
                    _context.Invoices.Add(invoice);
                }

                container.IsCleared = false;
                
            }
            else if (inspection.Result == "Pass")
            {
                
            }
            
            _context.Containers.Update(container);
            await _context.SaveChangesAsync();
        }
        public async Task<Inspection> SubmitInspectionAsync(InspectionDTO dto)
        {
            var container = await _context.Containers.FindAsync(dto.ContainerId);
            if (container == null)
            {
                container = new Container
                {
                    ContainerId = dto.ContainerId,
                    CurrentLocationId = dto.BayId,
                    ArrivalTime = DateTime.UtcNow,
                    CurrentStatus = "Inspection",
                    AssignedWharfClerk = dto.AssignedWharfClerk
                };
                _context.Containers.Add(container);
            }
            else
            {
                if (!string.IsNullOrEmpty(dto.AssignedWharfClerk))
                {
                    container.AssignedWharfClerk = dto.AssignedWharfClerk;
                }
            }

            var bay = await _context.Bays.FindAsync(dto.BayId);

            var inspection = new Inspection
            {
                Type = dto.InspectionType,
                Result = dto.Status, // Pass, Failed, Pending
                AdditionalCharges = dto.AdditionalCharges,
                Remarks = $"Officer: {dto.CustomOfficerName}, AssignedTo: {dto.AssignedWharfClerk}",
                InspectedAt = DateTime.UtcNow,
                ContainerId = dto.ContainerId,
                OfficerId = 1 // Assuming 1 is Admin
            };

            _context.Inspections.Add(inspection);

            if (dto.Status == "Pass")
            {
                if (bay != null)
                {
                    bay.IsOccupied = false;
                }
                container.CurrentLocationId = null; // Removed from Bay pending payment
            }
            else if (dto.Status == "Failed")
            {
                container.IsCleared = false;
                if (bay != null)
                {
                    bay.IsOccupied = false;
                }
                
                // Move to Stack
                var availableStack = await _context.Stacks.FirstOrDefaultAsync(s => !s.IsOccupied);
                if (availableStack != null)
                {
                    availableStack.IsOccupied = true;
                    container.CurrentLocationId = availableStack.LocationId;
                }
                else
                {
                    container.CurrentLocationId = null; 
                }
            }
            else if (dto.Status == "Pending")
            {
               
            }
            await _context.SaveChangesAsync();

            return inspection;
        }
    }
}
