using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

namespace Review.API.Services
{
    public class ReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET PLACE REVIEWS
        // =====================================================

        public async Task<List<ReviewItem>> GetReviewsAsync(
            int placeId)
        {
            return await _context.Reviews
                .Include(x => x.User)
                .Include(x => x.Place)
                .Where(x => x.PlaceId == placeId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        // =====================================================
        // GET BUSINESS REVIEWS
        // =====================================================

        public async Task<List<ReviewItem>> GetBusinessReviewsAsync(
            int businessId)
        {
            return await _context.Reviews
                .Include(x => x.User)
                .Include(x => x.Business)
                .Where(x => x.BusinessId == businessId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        // =====================================================
        // ADD REVIEW
        // =====================================================

        public async Task<ReviewItem> AddReviewAsync(
            ReviewItem review)
        {
            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            // Load related data after saving
            // so API response can contain reviewer/business/place
            await _context.Entry(review)
                .Reference(x => x.User)
                .LoadAsync();

            if (review.PlaceId.HasValue)
            {
                await _context.Entry(review)
                    .Reference(x => x.Place)
                    .LoadAsync();
            }

            if (review.BusinessId.HasValue)
            {
                await _context.Entry(review)
                    .Reference(x => x.Business)
                    .LoadAsync();
            }

            return review;
        }

        // =====================================================
        // DELETE REVIEW
        // =====================================================

        public async Task<bool> DeleteReviewAsync(
            int reviewId)
        {
            var review =
                await _context.Reviews.FindAsync(reviewId);

            if (review == null)
                return false;

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}