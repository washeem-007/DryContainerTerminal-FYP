using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Inspection
    {
        [Key]
        public int InspectionId { get; set; }

        public string Type { get; set; } = string.Empty; // Full/Partial
        public string Result { get; set; } = string.Empty; // Pass/Fail
        public decimal AdditionalCharges { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public DateTime InspectedAt { get; set; }

        // FK to Container
        public string ContainerId { get; set; } = string.Empty;
        [ForeignKey("ContainerId")]
        public virtual Container? Container { get; set; }

        // FK to User (Officer)
        public int OfficerId { get; set; }
        [ForeignKey("OfficerId")]
        public virtual User? Officer { get; set; }
    }
}
