using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Review.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessFavorites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PlaceId",
                table: "Favorites",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "BusinessId",
                table: "Favorites",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_BusinessId",
                table: "Favorites",
                column: "BusinessId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_BusinessId",
                table: "Favorites",
                columns: new[] { "UserId", "BusinessId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_Businesses_BusinessId",
                table: "Favorites",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "BusinessId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_Businesses_BusinessId",
                table: "Favorites");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_BusinessId",
                table: "Favorites");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_UserId_BusinessId",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "BusinessId",
                table: "Favorites");

            migrationBuilder.AlterColumn<int>(
                name: "PlaceId",
                table: "Favorites",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
