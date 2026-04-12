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

            // Scenario B: Pass/Fail Logic
            var container = await _context.Containers.FindAsync(inspection.ContainerId);
            if (container == null) return; // Should handle not found

            if (inspection.Result == "Fail")
            {
                // 1. Generate Invoice if applicable (e.g. random logic or based on request)
                // Assuming always generate invoice on fail for now or if charges exist
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

                // 2. Move container?
                // Example: If failed, maybe move to a "Quarantine" stack or Keep in Stack
                // For simplicity, let's say we set IsCleared to false so it stays in Stack
                container.IsCleared = false;
                
                // Optionally re-evaluate location (if we had a specific Quarantine area)
                // await _yardService.DecideStorageLocationAsync(container); 
            }
            else if (inspection.Result == "Pass")
            {
                // container.IsCleared = true; // DO NOT clear automatically
                // Maybe move to Bay (Green Lane) since it is now cleared?
                // await _yardService.DecideStorageLocationAsync(container);
            }
            
            _context.Containers.Update(container);
            await _context.SaveChangesAsync();
        }
        public async Task<Inspection> SubmitInspectionAsync(InspectionDTO dto)
        {
            var container = await _context.Containers.FindAsync(dto.ContainerId);
            if (container == null)
            {
                // For demonstration, lazy create the container if it wasn't added at the gate
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
                OfficerId = 1 // Assuming 1 is Admin for now as a fallback since auth isn't deeply tied to OfficerId yet
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
                    container.CurrentLocationId = null; // No stack available, fallback
                }
            }
            else if (dto.Status == "Pending")
            {
                // Do not change Yard Locations
            }

            // Let EF Core's built-in change tracking handle the Updates
            await _context.SaveChangesAsync();

            return inspection;
        }
    }
}
