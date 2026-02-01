using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "YardLocations",
                columns: table => new
                {
                    LocationId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LocationName = table.Column<string>(type: "TEXT", nullable: false),
                    IsOccupied = table.Column<bool>(type: "INTEGER", nullable: false),
                    CapacityTier = table.Column<int>(type: "INTEGER", nullable: false),
                    LocationType = table.Column<string>(type: "TEXT", maxLength: 13, nullable: false),
                    BayNumber = table.Column<int>(type: "INTEGER", nullable: true),
                    IsGreenLane = table.Column<bool>(type: "INTEGER", nullable: true),
                    StackLetter = table.Column<string>(type: "TEXT", nullable: true),
                    CurrentTier = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YardLocations", x => x.LocationId);
                });

            migrationBuilder.CreateTable(
                name: "Containers",
                columns: table => new
                {
                    ContainerId = table.Column<string>(type: "TEXT", nullable: false),
                    VehicleNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    OriginPort = table.Column<string>(type: "TEXT", nullable: false),
                    CurrentStatus = table.Column<string>(type: "TEXT", nullable: false),
                    IsCleared = table.Column<bool>(type: "INTEGER", nullable: false),
                    HasWeightSlip = table.Column<bool>(type: "INTEGER", nullable: false),
                    ArrivalTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CurrentLocationId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Containers", x => x.ContainerId);
                    table.ForeignKey(
                        name: "FK_Containers_YardLocations_CurrentLocationId",
                        column: x => x.CurrentLocationId,
                        principalTable: "YardLocations",
                        principalColumn: "LocationId");
                });

            migrationBuilder.CreateTable(
                name: "Inspections",
                columns: table => new
                {
                    InspectionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Result = table.Column<string>(type: "TEXT", nullable: false),
                    AdditionalCharges = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remarks = table.Column<string>(type: "TEXT", nullable: false),
                    InspectedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ContainerId = table.Column<string>(type: "TEXT", nullable: false),
                    OfficerId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inspections", x => x.InspectionId);
                    table.ForeignKey(
                        name: "FK_Inspections_Containers_ContainerId",
                        column: x => x.ContainerId,
                        principalTable: "Containers",
                        principalColumn: "ContainerId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inspections_Users_OfficerId",
                        column: x => x.OfficerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    InvoiceId = table.Column<string>(type: "TEXT", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsPaid = table.Column<bool>(type: "INTEGER", nullable: false),
                    InspectionId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.InvoiceId);
                    table.ForeignKey(
                        name: "FK_Invoices_Inspections_InspectionId",
                        column: x => x.InspectionId,
                        principalTable: "Inspections",
                        principalColumn: "InspectionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Containers_CurrentLocationId",
                table: "Containers",
                column: "CurrentLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_ContainerId",
                table: "Inspections",
                column: "ContainerId");

            migrationBuilder.CreateIndex(
                name: "IX_Inspections_OfficerId",
                table: "Inspections",
                column: "OfficerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InspectionId",
                table: "Invoices",
                column: "InspectionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Inspections");

            migrationBuilder.DropTable(
                name: "Containers");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "YardLocations");
        }
    }
}
