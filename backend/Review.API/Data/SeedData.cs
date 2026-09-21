
using Review.API.Models;

namespace Review.API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(AppDbContext context)
        {
            Console.WriteLine("===== Seed Data Started =====");

            // ==========================
            // Categories
            // ==========================

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category
                    {
                        CategoryName = "Restaurant",
                        Icon = "🍽",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Cafe",
                        Icon = "☕",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Hotel",
                        Icon = "🏨",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Gym",
                        Icon = "🏋",
                        ImageUrl = ""
                    }
                );

                await context.SaveChangesAsync();

                Console.WriteLine("Categories Added");
            }

            // ==========================
            // Notifications
            // ==========================

            if (!context.Notifications.Any())
            {
                context.Notifications.AddRange(
                    new Notification
                    {
                        Title = "Welcome",
                        Message = "Welcome to REVIO.",
                        IsRead = false
                    },
                    new Notification
                    {
                        Title = "Top Rated",
                        Message = "Explore today's top rated places.",
                        IsRead = false
                    },
                    new Notification
                    {
                        Title = "AI Review",
                        Message = "AI Review Summary is now available.",
                        IsRead = false
                    }
                );

                await context.SaveChangesAsync();

                Console.WriteLine("Notifications Added");
            }

            Console.WriteLine("===== Seed Data Completed =====");
        }
    }
}
