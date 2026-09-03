
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Models;

namespace Review.API.Services
{
    public class ReviewService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReviewService(
            AppDbContext context,
            IWebHostEnvironment environment,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        // =====================================================
        // MEDIA URL
        // =====================================================

        private string BuildMediaUrl(string relativeUrl)
        {
            var request = _httpContextAccessor.HttpContext?.Request;

            if (request == null)
            {
                return relativeUrl;
            }

            return $"{request.Scheme}://{request.Host}{relativeUrl}";
        }

        // =====================================================
        // GET UPLOAD DIRECTORY
        // =====================================================

        private string GetReviewUploadDirectory()
        {
            var webRootPath = _environment.WebRootPath;

            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot"
                );
            }

            var uploadDirectory = Path.Combine(
                webRootPath,
                "uploads",
                "reviews"
            );

            Directory.CreateDirectory(uploadDirectory);

            return uploadDirectory;
        }

        // =====================================================
        // GET MEDIA TYPE
        // =====================================================

        private string GetMediaType(string extension)
        {
            var imageExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            var videoExtensions = new[]
            {
                ".mp4",
                ".mov",
                ".webm"
            };

            if (imageExtensions.Contains(extension))
            {
                return "image";
            }

            if (videoExtensions.Contains(extension))
            {
                return "video";
            }

            throw new InvalidOperationException(
                "Unsupported media type."
            );
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
                .Include(x => x.Media)
                .Where(x => x.PlaceId == placeId);

            // =================================================
            // RATING FILTER
            // =================================================

            if (rating.HasValue &&
                rating.Value >= 1 &&
                rating.Value <= 5)
            {
                query = query.Where(
                    x => x.Rating == rating.Value
                );
            }

            // =================================================
            // TOTAL REVIEWS
            // =================================================

            var totalReviews =
                await query.CountAsync();

            // =================================================
            // RATING SUMMARY
            // =================================================

            var averageRating =
                totalReviews > 0
                    ? await query.AverageAsync(
                        x => (double)x.Rating
                    )
                    : 0;

            var fiveStarCount =
                await query.CountAsync(
                    x => x.Rating == 5
                );

            var fourStarCount =
                await query.CountAsync(
                    x => x.Rating == 4
                );

            var threeStarCount =
                await query.CountAsync(
                    x => x.Rating == 3
                );

            var twoStarCount =
                await query.CountAsync(
                    x => x.Rating == 2
                );

            var oneStarCount =
                await query.CountAsync(
                    x => x.Rating == 1
                );

            // =================================================
            // TOTAL PAGES
            // =================================================

            var totalPages =
                totalReviews == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalReviews /
                        (double)pageSize
                    );

            // =================================================
            // REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt
                    )
                    .ThenByDescending(
                        x => x.ReviewId
                    )
                    .Skip(
                        (page - 1) * pageSize
                    )
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

                        Media =
                            x.Media
                                .OrderBy(
                                    m => m.CreatedAt
                                )
                                .Select(
                                    m => new ReviewMediaDto
                                    {
                                        ReviewMediaId =
                                            m.ReviewMediaId,

                                        MediaUrl =
                                            m.MediaUrl,

                                        MediaType =
                                            m.MediaType,

                                        CreatedAt =
                                            m.CreatedAt
                                    }
                                )
                                .ToList(),

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            // =================================================
            // BUILD FULL MEDIA URL
            // =================================================

            foreach (var review in reviews)
            {
                foreach (var media in review.Media)
                {
                    media.MediaUrl =
                        BuildMediaUrl(
                            media.MediaUrl
                        );
                }
            }

            // =================================================
            // RETURN
            // =================================================

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
                        1
                    ),

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
                .Include(x => x.Media)
                .Where(
                    x => x.BusinessId == businessId
                );

            // =================================================
            // RATING FILTER
            // =================================================

            if (rating.HasValue &&
                rating.Value >= 1 &&
                rating.Value <= 5)
            {
                query = query.Where(
                    x => x.Rating == rating.Value
                );
            }

            // =================================================
            // TOTAL REVIEWS
            // =================================================

            var totalReviews =
                await query.CountAsync();

            // =================================================
            // RATING SUMMARY
            // =================================================

            var averageRating =
                totalReviews > 0
                    ? await query.AverageAsync(
                        x => (double)x.Rating
                    )
                    : 0;

            var fiveStarCount =
                await query.CountAsync(
                    x => x.Rating == 5
                );

            var fourStarCount =
                await query.CountAsync(
                    x => x.Rating == 4
                );

            var threeStarCount =
                await query.CountAsync(
                    x => x.Rating == 3
                );

            var twoStarCount =
                await query.CountAsync(
                    x => x.Rating == 2
                );

            var oneStarCount =
                await query.CountAsync(
                    x => x.Rating == 1
                );

            // =================================================
            // TOTAL PAGES
            // =================================================

            var totalPages =
                totalReviews == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalReviews /
                        (double)pageSize
                    );

            // =================================================
            // REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt
                    )
                    .ThenByDescending(
                        x => x.ReviewId
                    )
                    .Skip(
                        (page - 1) * pageSize
                    )
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

                        Media =
                            x.Media
                                .OrderBy(
                                    m => m.CreatedAt
                                )
                                .Select(
                                    m => new ReviewMediaDto
                                    {
                                        ReviewMediaId =
                                            m.ReviewMediaId,

                                        MediaUrl =
                                            m.MediaUrl,

                                        MediaType =
                                            m.MediaType,

                                        CreatedAt =
                                            m.CreatedAt
                                    }
                                )
                                .ToList(),

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            // =================================================
            // BUILD FULL MEDIA URL
            // =================================================

            foreach (var review in reviews)
            {
                foreach (var media in review.Media)
                {
                    media.MediaUrl =
                        BuildMediaUrl(
                            media.MediaUrl
                        );
                }
            }

            // =================================================
            // RETURN
            // =================================================

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
                        1
                    ),

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
                .Include(x => x.Media)
                .Where(
                    x => x.UserId == userId
                );

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
                        (double)pageSize
                    );

            // =================================================
            // MY REVIEWS
            // =================================================

            var reviews =
                await query
                    .OrderByDescending(
                        x => x.CreatedAt
                    )
                    .ThenByDescending(
                        x => x.ReviewId
                    )
                    .Skip(
                        (page - 1) * pageSize
                    )
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

                        Media =
                            x.Media
                                .OrderBy(
                                    m => m.CreatedAt
                                )
                                .Select(
                                    m => new ReviewMediaDto
                                    {
                                        ReviewMediaId =
                                            m.ReviewMediaId,

                                        MediaUrl =
                                            m.MediaUrl,

                                        MediaType =
                                            m.MediaType,

                                        CreatedAt =
                                            m.CreatedAt
                                    }
                                )
                                .ToList(),

                        OwnerReply =
                            x.OwnerReply,

                        OwnerReplyAt =
                            x.OwnerReplyAt
                    })
                    .ToListAsync();

            // =================================================
            // BUILD FULL MEDIA URL
            // =================================================

            foreach (var review in reviews)
            {
                foreach (var media in review.Media)
                {
                    media.MediaUrl =
                        BuildMediaUrl(
                            media.MediaUrl
                        );
                }
            }

            // =================================================
            // RETURN
            // =================================================

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
                    .Include(x => x.User)
                    .Include(x => x.Media)
                    .Where(x =>
                        x.ReviewId == reviewId &&
                        x.UserId == userId
                    )
                    .Select(x => new UserPublicProfileDto
                    {
                        User = new UserPublicProfileInfoDto
                        {
                            Id =
                                x.User!.Id,

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
                                x.CreatedAt,

                            Media =
                                x.Media
                                    .OrderBy(
                                        m => m.CreatedAt
                                    )
                                    .Select(
                                        m => new ReviewMediaDto
                                        {
                                            ReviewMediaId =
                                                m.ReviewMediaId,

                                            MediaUrl =
                                                m.MediaUrl,

                                            MediaType =
                                                m.MediaType,

                                            CreatedAt =
                                                m.CreatedAt
                                        }
                                    )
                                    .ToList()
                        }
                    })
                    .FirstOrDefaultAsync();

            // =================================================
            // BUILD FULL MEDIA URL
            // =================================================

            if (result != null)
            {
                foreach (var media in result.Review.Media)
                {
                    media.MediaUrl =
                        BuildMediaUrl(
                            media.MediaUrl
                        );
                }
            }

            return result;
        }

        // =====================================================
        // ADD REVIEW WITH PHOTOS / VIDEOS
        // =====================================================

        public async Task<ReviewItem> AddReviewAsync(
            ReviewDto reviewDto)
        {
            var review = new ReviewItem
            {
                UserId =
                    reviewDto.UserId,

                Rating =
                    reviewDto.Rating,

                Comment =
                    reviewDto.Comment.Trim(),

                PlaceId =
                    reviewDto.PlaceId,

                BusinessId =
                    reviewDto.BusinessId,

                CreatedAt =
                    DateTime.UtcNow
            };

            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            var mediaFiles =
                reviewDto.Media ??
                new List<IFormFile>();

            var savedFiles =
                new List<string>();

            try
            {
                // =================================================
                // SAVE MEDIA FILES
                // =================================================

                if (mediaFiles.Count > 0)
                {
                    var uploadDirectory =
                        GetReviewUploadDirectory();

                    foreach (var file in mediaFiles)
                    {
                        var extension =
                            Path.GetExtension(
                                file.FileName
                            ).ToLowerInvariant();

                        var mediaType =
                            GetMediaType(extension);

                        var fileName =
                            $"{Guid.NewGuid():N}{extension}";

                        var filePath =
                            Path.Combine(
                                uploadDirectory,
                                fileName
                            );

                        await using (
                            var stream =
                                new FileStream(
                                    filePath,
                                    FileMode.Create
                                ))
                        {
                            await file.CopyToAsync(
                                stream
                            );
                        }

                        savedFiles.Add(filePath);

                        var reviewMedia =
                            new ReviewMedia
                            {
                                ReviewId =
                                    review.ReviewId,

                                MediaUrl =
                                    $"/uploads/reviews/{fileName}",

                                MediaType =
                                    mediaType,

                                CreatedAt =
                                    DateTime.UtcNow
                            };

                        _context.ReviewMedias.Add(
                            reviewMedia
                        );
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch
            {
                // =================================================
                // DELETE PHYSICAL FILES IF DB SAVE FAILS
                // =================================================

                foreach (var filePath in savedFiles)
                {
                    try
                    {
                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }
                    }
                    catch
                    {
                        // Ignore cleanup error
                    }
                }

                // =================================================
                // DELETE REVIEW
                // =================================================

                _context.Reviews.Remove(review);

                await _context.SaveChangesAsync();

                throw;
            }

            // =================================================
            // LOAD USER
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

            // =================================================
            // LOAD MEDIA
            // =================================================

            await _context.Entry(review)
                .Collection(x => x.Media)
                .LoadAsync();

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
                    .Include(x => x.Media)
                    .FirstOrDefaultAsync(
                        x => x.ReviewId == reviewId
                    );

            if (review == null)
            {
                return false;
            }

            // =================================================
            // STORE MEDIA PATHS
            // =================================================

            var mediaFiles =
                review.Media
                    .Select(x => x.MediaUrl)
                    .ToList();

            // =================================================
            // DELETE REVIEW
            // =================================================

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            // =================================================
            // DELETE PHYSICAL MEDIA FILES
            // =================================================

            foreach (var mediaUrl in mediaFiles)
            {
                try
                {
                    var relativePath =
                        mediaUrl
                            .TrimStart('/')
                            .Replace(
                                '/',
                                Path.DirectorySeparatorChar
                            );

                    var webRootPath =
                        _environment.WebRootPath;

                    if (string.IsNullOrWhiteSpace(
                        webRootPath))
                    {
                        webRootPath =
                            Path.Combine(
                                _environment.ContentRootPath,
                                "wwwroot"
                            );
                    }

                    var fullPath =
                        Path.Combine(
                            webRootPath,
                            relativePath
                        );

                    if (File.Exists(fullPath))
                    {
                        File.Delete(fullPath);
                    }
                }
                catch
                {
                    // Ignore physical file cleanup error
                }
            }

            return true;
        }
    }
}

