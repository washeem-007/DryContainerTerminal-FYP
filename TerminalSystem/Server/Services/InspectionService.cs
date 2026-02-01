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
                container.IsCleared = true;
                // Maybe move to Bay (Green Lane) since it is now cleared?
                // await _yardService.DecideStorageLocationAsync(container);
            }
            
            _context.Containers.Update(container);
            await _context.SaveChangesAsync();
        }
    }
}
