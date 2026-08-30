
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
        // Business Rating and ReviewCount are calculated
        // directly from ReviewItem records so that the
        // Home page always shows the actual average rating.
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
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .ToListAsync();

            // ==========================================
            // BUSINESS REVIEW AGGREGATES
            // ==========================================
            //
            // Calculate actual average rating and
            // review count from ReviewItem table.
            //
            // Only reviews having BusinessId are included.
            // Place reviews are ignored.
            // ==========================================

            var businessReviewStats =
                await _context.Reviews
                    .AsNoTracking()
                    .Where(r =>
                        r.BusinessId.HasValue)
                    .GroupBy(r =>
                        r.BusinessId!.Value)
                    .Select(group => new
                    {
                        BusinessId = group.Key,

                        AverageRating =
                            group.Average(r =>
                                (double)r.Rating),

                        ReviewCount =
                            group.Count()
                    })
                    .ToDictionaryAsync(
                        x => x.BusinessId);

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
                // GET ACTUAL BUSINESS REVIEW STATS
                // ==========================================

                var hasReviews =
                    businessReviewStats.TryGetValue(
                        business.BusinessId,
                        out var reviewStats);

                var averageRating =
                    hasReviews
                        ? reviewStats!.AverageRating
                        : 0;

                var reviewCount =
                    hasReviews
                        ? reviewStats!.ReviewCount
                        : 0;

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

                    // Actual average calculated
                    // from ReviewItem records
                    Rating = averageRating,

                    // Actual review count
                    // from ReviewItem records
                    ReviewCount = reviewCount,

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

