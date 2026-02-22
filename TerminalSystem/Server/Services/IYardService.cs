using Server.Models;

namespace Server.Services
{
    public interface IYardService
    {
        Task<bool> DecideStorageLocationAsync(Container container);
        Task<object> GetYardSummaryAsync();
        Task<IEnumerable<Bay>> GetBaysAsync();
        Task<bool> ReleaseBayAsync(int bayNumber);
    }
}
