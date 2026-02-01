using Server.Models;

namespace Server.Services
{
    public interface IInspectionService
    {
        Task ProcessInspectionAsync(Inspection inspection);
    }
}
