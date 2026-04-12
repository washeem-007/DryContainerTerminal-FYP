namespace Server.Models
{
    public class InspectionDTO
    {
        public string ContainerId { get; set; } = string.Empty;
        public int BayId { get; set; }
        public string Status { get; set; } = string.Empty; // Pass, Failed, Pending
        public string CustomOfficerName { get; set; } = string.Empty;
        public string InspectionType { get; set; } = string.Empty;
        public decimal AdditionalCharges { get; set; }
        public string? AssignedWharfClerk { get; set; }
    }
}
