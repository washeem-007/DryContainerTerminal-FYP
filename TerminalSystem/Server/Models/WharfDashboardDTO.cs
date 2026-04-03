namespace Server.Models
{
    public class WharfDashboardDTO
    {
        public string ContainerId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int DaysInTerminal { get; set; }
        public string Shipper { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string TotalDue { get; set; } = string.Empty;
    }
}
