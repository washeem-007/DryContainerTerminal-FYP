using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Container
    {
        [Key]
        public string ContainerId { get; set; } = string.Empty;

        public string VehicleNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g., "40ft HC"
        public string OriginPort { get; set; } = string.Empty;
        public string Shipper { get; set; } = string.Empty;
        public string CurrentStatus { get; set; } = string.Empty; // e.g., "Entry", "Stacked"
        public bool IsCleared { get; set; } = false;
        public bool HasWeightSlip { get; set; }
        public DateTime ArrivalTime { get; set; } = DateTime.UtcNow;

        // Soft delete flag
        public bool IsArchived { get; set; } = false;

        // Foreign Key to YardLocation (Nullable)
        public int? CurrentLocationId { get; set; }
        [ForeignKey("CurrentLocationId")]
        public virtual YardLocation? CurrentLocation { get; set; }

        public virtual ICollection<Inspection> Inspections { get; set; } = new List<Inspection>();

        [NotMapped]
        public int? PreferredBayNumber { get; set; }
    }
}
