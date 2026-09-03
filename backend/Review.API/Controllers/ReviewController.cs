
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewController(
            ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // =====================================================
        // GET BUSINESS REVIEWS
        // =====================================================

        [HttpGet("business/{businessId}")]
        public async Task<IActionResult> GetBusinessReviews(
            int businessId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? rating = null)
        {
            try
            {
                if (businessId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid business ID."
                    });
                }

                if (page < 1)
                    page = 1;

                if (pageSize < 1)
                    pageSize = 10;

                if (pageSize > 50)
                    pageSize = 50;

                if (rating.HasValue &&
                    (rating.Value < 1 ||
                     rating.Value > 5))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Rating must be between 1 and 5."
                    });
                }

                var result =
                    await _reviewService
                        .GetBusinessReviewsAsync(
                            businessId,
                            page,
                            pageSize,
                            rating);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to load business reviews.",
                        error = ex.Message
                    });
            }
        }

        // =====================================================
        // GET PLACE REVIEWS
        // =====================================================

        [HttpGet("place/{placeId}")]
        public async Task<IActionResult> GetPlaceReviews(
            int placeId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? rating = null)
        {
            try
            {
                if (placeId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid place ID."
                    });
                }

                if (page < 1)
                    page = 1;

                if (pageSize < 1)
                    pageSize = 10;

                if (pageSize > 50)
                    pageSize = 50;

                if (rating.HasValue &&
                    (rating.Value < 1 ||
                     rating.Value > 5))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Rating must be between 1 and 5."
                    });
                }

                var result =
                    await _reviewService
                        .GetReviewsAsync(
                            placeId,
                            page,
                            pageSize,
                            rating);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to load place reviews.",
                        error = ex.Message
                    });
            }
        }

        // =====================================================
        // GET MY REVIEWS - PAGINATED
        // =====================================================

        [HttpGet("my/{userId}")]
        public async Task<IActionResult> GetMyReviews(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid user ID."
                    });
                }

                if (page < 1)
                    page = 1;

                if (pageSize < 1)
                    pageSize = 10;

                if (pageSize > 50)
                    pageSize = 50;

                var result =
                    await _reviewService
                        .GetMyReviewsAsync(
                            userId,
                            page,
                            pageSize);

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to load your reviews.",
                        error = ex.Message
                    });
            }
        }

        // =====================================================
        // GET USER PUBLIC PROFILE + CLICKED REVIEW
        // =====================================================

        [HttpGet("user/{userId}/review/{reviewId}")]
        public async Task<IActionResult> GetUserPublicProfile(
            int userId,
            int reviewId)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid user ID."
                    });
                }

                if (reviewId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid review ID."
                    });
                }

                var result =
                    await _reviewService
                        .GetUserPublicProfileAsync(
                            userId,
                            reviewId);

                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "User or review not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to load user profile and review.",
                        error = ex.Message
                    });
            }
        }

        // =====================================================
        // ADD REVIEW WITH PHOTOS / VIDEOS
        // =====================================================

        [HttpPost]
        [RequestSizeLimit(300_000_000)]
        public async Task<IActionResult> AddReview(
            [FromForm] ReviewDto reviewDto)
        {
            try
            {
                // =====================================================
                // BASIC VALIDATION
                // =====================================================

                if (reviewDto.UserId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid reviewer."
                    });
                }

                if (reviewDto.Rating < 1 ||
                    reviewDto.Rating > 5)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Rating must be between 1 and 5."
                    });
                }

                if (!reviewDto.PlaceId.HasValue &&
                    !reviewDto.BusinessId.HasValue)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Either PlaceId or BusinessId is required."
                    });
                }

                if (string.IsNullOrWhiteSpace(
                    reviewDto.Comment))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Review comment is required."
                    });
                }

                if (reviewDto.Comment.Length > 500)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Review comment cannot exceed 500 characters."
                    });
                }

                // =====================================================
                // MEDIA VALIDATION
                // =====================================================

                var mediaFiles =
                    reviewDto.Media ?? new List<IFormFile>();

                if (mediaFiles.Count > 5)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "You can upload a maximum of 5 photos or videos."
                    });
                }

                foreach (var file in mediaFiles)
                {
                    if (file == null ||
                        file.Length <= 0)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message =
                                "One of the selected media files is invalid."
                        });
                    }

                    var extension =
                        Path.GetExtension(file.FileName)
                            .ToLowerInvariant();

                    var imageExtensions =
                        new[]
                        {
                            ".jpg",
                            ".jpeg",
                            ".png",
                            ".webp"
                        };

                    var videoExtensions =
                        new[]
                        {
                            ".mp4",
                            ".mov",
                            ".webm"
                        };

                    var isImage =
                        imageExtensions.Contains(extension);

                    var isVideo =
                        videoExtensions.Contains(extension);

                    if (!isImage && !isVideo)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message =
                                $"Unsupported media format: {extension}"
                        });
                    }

                    var maxSize =
                        isImage
                            ? 5 * 1024 * 1024
                            : 50 * 1024 * 1024;

                    if (file.Length > maxSize)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message =
                                isImage
                                    ? "Each image must be 5 MB or smaller."
                                    : "Each video must be 50 MB or smaller."
                        });
                    }
                }

                // =====================================================
                // SAVE REVIEW
                // =====================================================

                var result =
                    await _reviewService
                        .AddReviewAsync(
                            reviewDto);

                // =====================================================
                // CREATE SAFE RESPONSE
                // =====================================================
                //
                // IMPORTANT:
                //
                // Do NOT return the ReviewItem EF entity directly.
                //
                // ReviewItem contains navigation properties:
                //
                // ReviewItem
                //      -> Media
                //          -> Review
                //              -> Media
                //                  -> Review
                //
                // This creates a circular JSON reference.
                //
                // We therefore return only the fields required by
                // the frontend.
                //
                // This also prevents sensitive User entity fields
                // such as PasswordHash from being returned.
                // =====================================================

                var response = new
                {
                    reviewId = result.ReviewId,

                    rating = result.Rating,

                    comment = result.Comment,

                    createdAt = result.CreatedAt,

                    userId = result.UserId,

                    placeId = result.PlaceId,

                    businessId = result.BusinessId,

                    media = result.Media?
                        .Select(media => new
                        {
                            reviewMediaId =
                                media.ReviewMediaId,

                            reviewId =
                                media.ReviewId,

                            mediaUrl =
                                media.MediaUrl,

                            mediaType =
                                media.MediaType,

                            createdAt =
                                media.CreatedAt
                        })
                        .ToList()
                };

                // =====================================================
                // SUCCESS RESPONSE
                // =====================================================

                return Ok(new
                {
                    success = true,

                    message =
                        "Review added successfully.",

                    data = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to add review.",
                        error = ex.Message
                    });
            }
        }

        // =====================================================
        // DELETE REVIEW
        // =====================================================

        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(
            int reviewId)
        {
            try
            {
                var deleted =
                    await _reviewService
                        .DeleteReviewAsync(
                            reviewId);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Review not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Review deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,
                        message =
                            "Failed to delete review.",
                        error = ex.Message
                    });
            }
        }
    }
}

