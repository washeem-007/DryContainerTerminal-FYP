using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Invoice
    {
        [Key]
        public string InvoiceId { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }
        public bool IsPaid { get; set; }

        // FK to Inspection
        public int InspectionId { get; set; }
        [ForeignKey("InspectionId")]
        public virtual Inspection? Inspection { get; set; }
    }
}
