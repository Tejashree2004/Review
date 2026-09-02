
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
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
        // GET PLACE REVIEWS - PAGINATED
        // =====================================================

        public async Task<ReviewPaginationDto> GetReviewsAsync(
            int placeId,
            int page = 1,
            int pageSize = 10,
            int? rating = null)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 50)
                pageSize = 50;

            var query = _context.Reviews
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Place)
                .Where(x => x.PlaceId == placeId);

            // =================================================
            // RATING FILTER
            // =================================================

            if (rating.HasValue &&
                rating.Value >= 1 &&
                rating.Value <= 5)
            {
                query = query.Where(
                    x => x.Rating == rating.Value);
            }

            // =================================================
            // TOTAL
            // =================================================

            var totalReviews =
                await query.CountAsync();

            // =================================================
            // RATING SUMMARY
            // =================================================

            var averageRating =
                totalReviews > 0
                    ? await query
                        .AverageAsync(x => (double)x.Rating)
                    : 0;

            var fiveStarCount =
                await query.CountAsync(
                    x => x.Rating == 5);

            var fourStarCount =
                await query.CountAsync(
                    x => x.Rating == 4);

            var threeStarCount =
                await query.CountAsync(
                    x => x.Rating == 3);

            var twoStarCount =
                await query.CountAsync(
                    x => x.Rating == 2);

            var oneStarCount =
                await query.CountAsync(
                    x => x.Rating == 1);

            // =================================================
            // TOTAL PAGES
            // =================================================

            var totalPages =
                totalReviews == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalReviews /
                        (double)pageSize);

            // =================================================
            // REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt)
                    .ThenByDescending(
                        x => x.ReviewId)
                    .Skip(
                        (page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new ReviewItemDto
                    {
                        ReviewId =
                            x.ReviewId,

                        Rating =
                            x.Rating,

                        Comment =
                            x.Comment,

                        CreatedAt =
                            x.CreatedAt,

                        UserId =
                            x.UserId,

                        UserName =
                            x.User != null
                                ? x.User.FullName
                                : null,

                        PlaceId =
                            x.PlaceId,

                        PlaceName =
                            x.Place != null
                                ? x.Place.Name
                                : null,

                        BusinessId =
                            x.BusinessId,

                        BusinessName =
                            null,

                        BusinessAddress =
                            null,

                        BusinessCity =
                            null,

                        BusinessPincode =
                            null,

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            return new ReviewPaginationDto
            {
                Reviews =
                    reviews,

                TotalReviews =
                    totalReviews,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalPages =
                    totalPages,

                HasMore =
                    page < totalPages,

                AverageRating =
                    Math.Round(
                        averageRating,
                        1),

                FiveStarCount =
                    fiveStarCount,

                FourStarCount =
                    fourStarCount,

                ThreeStarCount =
                    threeStarCount,

                TwoStarCount =
                    twoStarCount,

                OneStarCount =
                    oneStarCount
            };
        }

        // =====================================================
        // GET BUSINESS REVIEWS - PAGINATED
        // =====================================================

        public async Task<ReviewPaginationDto>
            GetBusinessReviewsAsync(
                int businessId,
                int page = 1,
                int pageSize = 10,
                int? rating = null)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 50)
                pageSize = 50;

            var query = _context.Reviews
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Business)
                .Where(
                    x => x.BusinessId == businessId);

            // =================================================
            // RATING FILTER
            // =================================================

            if (rating.HasValue &&
                rating.Value >= 1 &&
                rating.Value <= 5)
            {
                query = query.Where(
                    x => x.Rating == rating.Value);
            }

            // =================================================
            // TOTAL
            // =================================================

            var totalReviews =
                await query.CountAsync();

            // =================================================
            // RATING SUMMARY
            // =================================================

            var averageRating =
                totalReviews > 0
                    ? await query
                        .AverageAsync(
                            x => (double)x.Rating)
                    : 0;

            var fiveStarCount =
                await query.CountAsync(
                    x => x.Rating == 5);

            var fourStarCount =
                await query.CountAsync(
                    x => x.Rating == 4);

            var threeStarCount =
                await query.CountAsync(
                    x => x.Rating == 3);

            var twoStarCount =
                await query.CountAsync(
                    x => x.Rating == 2);

            var oneStarCount =
                await query.CountAsync(
                    x => x.Rating == 1);

            // =================================================
            // TOTAL PAGES
            // =================================================

            var totalPages =
                totalReviews == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalReviews /
                        (double)pageSize);

            // =================================================
            // REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt)
                    .ThenByDescending(
                        x => x.ReviewId)
                    .Skip(
                        (page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new ReviewItemDto
                    {
                        ReviewId =
                            x.ReviewId,

                        Rating =
                            x.Rating,

                        Comment =
                            x.Comment,

                        CreatedAt =
                            x.CreatedAt,

                        UserId =
                            x.UserId,

                        UserName =
                            x.User != null
                                ? x.User.FullName
                                : null,

                        PlaceId =
                            x.PlaceId,

                        PlaceName =
                            null,

                        BusinessId =
                            x.BusinessId,

                        BusinessName =
                            x.Business != null
                                ? x.Business.BusinessName
                                : null,

                        BusinessAddress =
                            x.Business != null
                                ? x.Business.Address
                                : null,

                        BusinessCity =
                            x.Business != null
                                ? x.Business.City
                                : null,

                        BusinessPincode =
                            x.Business != null
                                ? x.Business.Pincode
                                : null,

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            return new ReviewPaginationDto
            {
                Reviews =
                    reviews,

                TotalReviews =
                    totalReviews,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalPages =
                    totalPages,

                HasMore =
                    page < totalPages,

                AverageRating =
                    Math.Round(
                        averageRating,
                        1),

                FiveStarCount =
                    fiveStarCount,

                FourStarCount =
                    fourStarCount,

                ThreeStarCount =
                    threeStarCount,

                TwoStarCount =
                    twoStarCount,

                OneStarCount =
                    oneStarCount
            };
        }

        // =====================================================
        // GET MY REVIEWS - PAGINATED
        // =====================================================

        public async Task<ReviewPaginationDto>
            GetMyReviewsAsync(
                int userId,
                int page = 1,
                int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 50)
                pageSize = 50;

            var query = _context.Reviews
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Place)
                .Include(x => x.Business)
                .Where(
                    x => x.UserId == userId);

            // =================================================
            // TOTAL REVIEWS
            // =================================================

            var totalReviews =
                await query.CountAsync();

            // =================================================
            // TOTAL PAGES
            // =================================================

            var totalPages =
                totalReviews == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalReviews /
                        (double)pageSize);

            // =================================================
            // MY REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt)
                    .ThenByDescending(
                        x => x.ReviewId)
                    .Skip(
                        (page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new ReviewItemDto
                    {
                        ReviewId =
                            x.ReviewId,

                        Rating =
                            x.Rating,

                        Comment =
                            x.Comment,

                        CreatedAt =
                            x.CreatedAt,

                        UserId =
                            x.UserId,

                        UserName =
                            x.User != null
                                ? x.User.FullName
                                : null,

                        PlaceId =
                            x.PlaceId,

                        PlaceName =
                            x.Place != null
                                ? x.Place.Name
                                : null,

                        BusinessId =
                            x.BusinessId,

                        BusinessName =
                            x.Business != null
                                ? x.Business.BusinessName
                                : null,

                        // =================================================
                        // BUSINESS LOCATION
                        // =================================================

                        BusinessAddress =
                            x.Business != null
                                ? x.Business.Address
                                : null,

                        BusinessCity =
                            x.Business != null
                                ? x.Business.City
                                : null,

                        BusinessPincode =
                            x.Business != null
                                ? x.Business.Pincode
                                : null,

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            return new ReviewPaginationDto
            {
                Reviews =
                    reviews,

                TotalReviews =
                    totalReviews,

                Page =
                    page,

                PageSize =
                    pageSize,

                TotalPages =
                    totalPages,

                HasMore =
                    page < totalPages,

                AverageRating =
                    0,

                FiveStarCount =
                    0,

                FourStarCount =
                    0,

                ThreeStarCount =
                    0,

                TwoStarCount =
                    0,

                OneStarCount =
                    0
            };
        }

        // =====================================================
        // GET USER PUBLIC PROFILE + CLICKED REVIEW
        // =====================================================

        public async Task<UserPublicProfileDto?>
            GetUserPublicProfileAsync(
                int userId,
                int reviewId)
        {
            if (userId <= 0 ||
                reviewId <= 0)
            {
                return null;
            }

            var result =
                await _context.Reviews
                    .AsNoTracking()
                    .Where(x =>
                        x.ReviewId == reviewId &&
                        x.UserId == userId)
                    .Select(x => new UserPublicProfileDto
                    {
                        User = new UserPublicProfileInfoDto
                        {
                            Id =
                                x.User.Id,

                            FullName =
                                x.User.FullName,

                            CreatedAt =
                                x.User.CreatedAt
                        },

                        Review = new UserPublicReviewDto
                        {
                            ReviewId =
                                x.ReviewId,

                            Rating =
                                x.Rating,

                            Comment =
                                x.Comment,

                            CreatedAt =
                                x.CreatedAt
                        }
                    })
                    .FirstOrDefaultAsync();

            return result;
        }

        // =====================================================
        // ADD REVIEW
        // =====================================================

        public async Task<ReviewItem> AddReviewAsync(
            ReviewItem review)
        {
            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            // =================================================
            // LOAD REVIEWER
            // =================================================

            await _context.Entry(review)
                .Reference(x => x.User)
                .LoadAsync();

            // =================================================
            // LOAD PLACE
            // =================================================

            if (review.PlaceId.HasValue)
            {
                await _context.Entry(review)
                    .Reference(x => x.Place)
                    .LoadAsync();
            }

            // =================================================
            // LOAD BUSINESS
            // =================================================

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
                await _context.Reviews
                    .FindAsync(reviewId);

            if (review == null)
                return false;

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}

