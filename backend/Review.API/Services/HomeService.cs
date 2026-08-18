using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

namespace Review.API.Services
{
    public class HomeService
    {
        private readonly AppDbContext _context;

        public HomeService(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GET ALL CATEGORIES
        // ==========================================

        public async Task<List<Category>> GetCategoriesAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.CategoryName)
                .ToListAsync();
        }

        // ==========================================
        // GET TOP RATED PLACES + OWNER BUSINESSES
        // ==========================================
        //
        // Existing Place data is preserved.
        //
        // Owner-created Business data is also added.
        //
        // Both are returned in a common card-friendly
        // response structure.
        // ==========================================

        public async Task<List<object>> GetTopRatedPlacesAsync()
        {
            // ==========================================
            // EXISTING PLACES
            // ==========================================

            var places = await _context.Places
                .AsNoTracking()
                .Include(p => p.Category)
                .OrderByDescending(p => p.Rating)
                .Take(10)
                .ToListAsync();

            // ==========================================
            // OWNER BUSINESSES
            // ==========================================

            var businesses = await _context.Businesses
                .AsNoTracking()
                .Include(b => b.Category)
                .Include(b => b.Photos)
                .Where(b =>
                    b.IsActive &&
                    b.IsApproved)
                .OrderByDescending(b => b.Rating)
                .ThenByDescending(b => b.CreatedAt)
                .Take(10)
                .ToListAsync();

            // ==========================================
            // COMMON HOME CARD LIST
            // ==========================================

            var result = new List<object>();

            // ==========================================
            // ADD EXISTING PLACES
            // ==========================================

            foreach (var place in places)
            {
                result.Add(new
                {
                    // Existing Place information
                    PlaceId = place.PlaceId,

                    BusinessId = (int?)null,

                    Name = place.Name,

                    CategoryId = place.CategoryId,

                    Category = place.Category,

                    Address = place.Address,

                    City = place.City,

                    Rating = place.Rating,

                    ReviewCount = place.ReviewCount,

                    ImageUrl = place.ImageUrl,

                    OpenStatus = place.OpenStatus,

                    // Helps frontend identify source
                    Type = "Place"
                });
            }

            // ==========================================
            // ADD OWNER BUSINESSES
            // ==========================================

            foreach (var business in businesses)
            {
                // ==========================================
                // FIND PRIMARY / COVER PHOTO
                // ==========================================

                var primaryPhoto =
                    business.Photos
                        .Where(p => p.IsPrimary)
                        .OrderByDescending(p => p.CreatedAt)
                        .FirstOrDefault();

                // ==========================================
                // FALLBACK TO LATEST PHOTO
                // ==========================================

                var fallbackPhoto =
                    business.Photos
                        .OrderByDescending(p => p.CreatedAt)
                        .FirstOrDefault();

                var imageUrl =
                    primaryPhoto?.PhotoUrl
                    ?? fallbackPhoto?.PhotoUrl
                    ?? string.Empty;

                // ==========================================
                // ADD BUSINESS TO HOME CARD LIST
                // ==========================================

                result.Add(new
                {
                    // No Place ID
                    PlaceId = (int?)null,

                    // Actual Business ID
                    BusinessId = business.BusinessId,

                    Name = business.BusinessName,

                    CategoryId = business.CategoryId,

                    Category = business.Category,

                    Address = business.Address,

                    City = business.City,

                    Rating = business.Rating,

                    ReviewCount = business.ReviewCount,

                    // Primary business photo
                    ImageUrl = imageUrl,

                    OpenStatus = business.IsOpen,

                    // Helps frontend identify source
                    Type = "Business"
                });
            }

            // ==========================================
            // SORT EVERYTHING TOGETHER
            // ==========================================

            return result
                .OrderByDescending(x =>
                {
                    var property =
                        x.GetType()
                            .GetProperty("Rating");

                    return property?.GetValue(x) ?? 0;
                })
                .Take(20)
                .ToList();
        }

        // ==========================================
        // GET PLACE DETAILS
        // ==========================================

        public async Task<Place?> GetPlaceAsync(int id)
        {
            return await _context.Places
                .AsNoTracking()
                .Include(p => p.Category)
                .FirstOrDefaultAsync(
                    p => p.PlaceId == id);
        }
    }
}