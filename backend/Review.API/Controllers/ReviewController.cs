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

        public ReviewController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // ==========================================
        // GET: api/review/place/1
        // Get all reviews of a place
        // ==========================================

        [HttpGet("place/{placeId}")]
        public async Task<IActionResult> GetReviews(int placeId)
        {
            var reviews =
                await _reviewService.GetReviewsAsync(placeId);

            return Ok(new
            {
                Success = true,
                Message = "Reviews fetched successfully.",
                Data = reviews
            });
        }

        // ==========================================
        // GET: api/review/business/1
        // Get all reviews of a business
        // ==========================================

        [HttpGet("business/{businessId}")]
        public async Task<IActionResult> GetBusinessReviews(
            int businessId)
        {
            var reviews =
                await _reviewService.GetBusinessReviewsAsync(
                    businessId);

            return Ok(new
            {
                Success = true,
                Message = "Business reviews fetched successfully.",
                Data = reviews
            });
        }

        // ==========================================
        // POST: api/review
        // Add Review
        //
        // Supports:
        // 1. Place Review
        // 2. Business Review
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> AddReview(
            [FromBody] ReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Invalid review data.",
                    Errors = ModelState
                });
            }

            // ==========================================
            // PLACE / BUSINESS VALIDATION
            // Exactly one must be provided
            // ==========================================

            if (!dto.PlaceId.HasValue &&
                !dto.BusinessId.HasValue)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message =
                        "Either PlaceId or BusinessId is required."
                });
            }

            if (dto.PlaceId.HasValue &&
                dto.BusinessId.HasValue)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message =
                        "A review cannot belong to both a Place and a Business."
                });
            }

            // ==========================================
            // RATING VALIDATION
            // ==========================================

            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message =
                        "Rating must be between 1 and 5."
                });
            }

            // ==========================================
            // COMMENT VALIDATION
            // ==========================================

            if (string.IsNullOrWhiteSpace(dto.Comment))
            {
                return BadRequest(new
                {
                    Success = false,
                    Message =
                        "Review comment is required."
                });
            }

            // ==========================================
            // CREATE REVIEW
            // ==========================================

            var review = new ReviewItem
            {
                UserId = dto.UserId,

                PlaceId = dto.PlaceId,

                BusinessId = dto.BusinessId,

                Rating = dto.Rating,

                Comment = dto.Comment.Trim(),

                CreatedAt = DateTime.UtcNow
            };

            // ==========================================
            // SAVE REVIEW
            // ==========================================

            var result =
                await _reviewService.AddReviewAsync(review);

            return Ok(new
            {
                Success = true,
                Message = "Review added successfully.",
                Data = result
            });
        }

        // ==========================================
        // DELETE: api/review/5
        // Delete Review
        // ==========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var deleted =
                await _reviewService.DeleteReviewAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Review not found."
                });
            }

            return Ok(new
            {
                Success = true,
                Message = "Review deleted successfully."
            });
        }
    }
}