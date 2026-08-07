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

                    new Category { CategoryName = "Restaurant", Icon = "🍽", ImageUrl = "" },
                    new Category { CategoryName = "Cafe", Icon = "☕", ImageUrl = "" },
                    new Category { CategoryName = "Hotel", Icon = "🏨", ImageUrl = "" },
                    new Category { CategoryName = "Gym", Icon = "🏋", ImageUrl = "" }

                );

                await context.SaveChangesAsync();

                Console.WriteLine("Categories Added");
            }

            // ==========================
            // Places
            // ==========================

            if (!context.Places.Any())
            {
                var restaurant = context.Categories.First(c => c.CategoryName == "Restaurant");
                var cafe = context.Categories.First(c => c.CategoryName == "Cafe");
                var hotel = context.Categories.First(c => c.CategoryName == "Hotel");
                var gym = context.Categories.First(c => c.CategoryName == "Gym");

                context.Places.AddRange(

                    new Place
                    {
                        Name = "Domino's Pizza",
                        CategoryId = restaurant.CategoryId,
                        Address = "FC Road",
                        City = "Pune",
                        Rating = 4.5,
                        ReviewCount = 220,
                        ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591",
                        OpenStatus = true
                    },

                    new Place
                    {
                        Name = "Pizza Hut",
                        CategoryId = restaurant.CategoryId,
                        Address = "JM Road",
                        City = "Pune",
                        Rating = 4.3,
                        ReviewCount = 180,
                        ImageUrl = "https://images.unsplash.com/photo-1548365328-9f547fb0953b",
                        OpenStatus = true
                    },

                    new Place
                    {
                        Name = "Cafe Coffee Day",
                        CategoryId = cafe.CategoryId,
                        Address = "Baner",
                        City = "Pune",
                        Rating = 4.4,
                        ReviewCount = 110,
                        ImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                        OpenStatus = true
                    },

                    new Place
                    {
                        Name = "Starbucks",
                        CategoryId = cafe.CategoryId,
                        Address = "Phoenix Mall",
                        City = "Pune",
                        Rating = 4.8,
                        ReviewCount = 320,
                        ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
                        OpenStatus = true
                    },

                    new Place
                    {
                        Name = "JW Marriott",
                        CategoryId = hotel.CategoryId,
                        Address = "SB Road",
                        City = "Pune",
                        Rating = 4.9,
                        ReviewCount = 450,
                        ImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945",
                        OpenStatus = true
                    },

                    new Place
                    {
                        Name = "Cult Fit Gym",
                        CategoryId = gym.CategoryId,
                        Address = "Kothrud",
                        City = "Pune",
                        Rating = 4.7,
                        ReviewCount = 190,
                        ImageUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
                        OpenStatus = true
                    }

                );

                await context.SaveChangesAsync();

                Console.WriteLine("Places Added");
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