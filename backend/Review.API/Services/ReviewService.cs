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

        public async Task<List<ReviewItem>> GetReviewsAsync(int placeId)
        {
            return await _context.Reviews
                .Include(x => x.User)
                .Include(x => x.Place)
                .Where(x => x.PlaceId == placeId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<ReviewItem> AddReviewAsync(ReviewItem review)
        {
            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);

            if (review == null)
                return false;

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}