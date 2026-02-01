using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public abstract class YardLocation
    {
        [Key]
        public int LocationId { get; set; }

        [Required]
        public string LocationName { get; set; } = string.Empty;

        public bool IsOccupied { get; set; }
        public int CapacityTier { get; set; }
    }
}
