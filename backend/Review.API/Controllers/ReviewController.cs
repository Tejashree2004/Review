using Microsoft.AspNetCore.Mvc;
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
        // ADD REVIEW
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> AddReview(
            [FromBody] ReviewItem review)
        {
            try
            {
                if (review.UserId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid reviewer."
                    });
                }

                if (review.Rating < 1 ||
                    review.Rating > 5)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Rating must be between 1 and 5."
                    });
                }

                if (!review.PlaceId.HasValue &&
                    !review.BusinessId.HasValue)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Either PlaceId or BusinessId is required."
                    });
                }

                var result =
                    await _reviewService
                        .AddReviewAsync(review);

                return Ok(new
                {
                    success = true,
                    message =
                        "Review added successfully.",
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