using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Review.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedMoreCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailOtps_UserId",
                table: "EmailOtps");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "CategoryName", "Icon", "ImageUrl" },
                values: new object[,]
                {
                    { 5, "Salon", "💇", "" },
                    { 6, "Gym", "🏋️", "" },
                    { 7, "Bakery", "🥐", "" },
                    { 8, "Pharmacy", "💊", "" },
                    { 9, "Shopping", "🛍️", "" },
                    { 10, "Supermarket", "🛒", "" },
                    { 11, "Spa", "💆", "" },
                    { 12, "Cinema", "🎬", "" },
                    { 13, "Electronics", "📱", "" },
                    { 14, "Clothing", "👗", "" },
                    { 15, "Jewellery", "💍", "" },
                    { 16, "Bookstore", "📚", "" },
                    { 17, "Pet Store", "🐾", "" },
                    { 18, "Travel Agency", "✈️", "" },
                    { 19, "Car Service", "🚗", "" },
                    { 20, "Real Estate", "🏠", "" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailOtps_UserId_CreatedAt",
                table: "EmailOtps",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailOtps_UserId_CreatedAt",
                table: "EmailOtps");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 20);

            migrationBuilder.CreateIndex(
                name: "IX_EmailOtps_UserId",
                table: "EmailOtps",
                column: "UserId");
        }
    }
}
