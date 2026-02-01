using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<YardLocation> YardLocations { get; set; }
        public DbSet<Bay> Bays { get; set; }
        public DbSet<Stack> Stacks { get; set; }
        public DbSet<Container> Containers { get; set; }
        public DbSet<Inspection> Inspections { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure TPH for YardLocation
            modelBuilder.Entity<YardLocation>()
                .HasDiscriminator<string>("LocationType")
                .HasValue<Bay>("Bay")
                .HasValue<Stack>("Stack");

            // Fix Decimal Precision
            modelBuilder.Entity<Inspection>()
                .Property(i => i.AdditionalCharges)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalAmount)
                .HasColumnType("decimal(18,2)");
        }
    }
}
