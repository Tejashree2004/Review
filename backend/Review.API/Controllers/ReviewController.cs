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
            var reviews = await _reviewService.GetReviewsAsync(placeId);

            return Ok(new
            {
                Success = true,
                Message = "Reviews fetched successfully.",
                Data = reviews
            });
        }

        // ==========================================
        // POST: api/review
        // Add Review
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var review = new ReviewItem
            {
                UserId = dto.UserId,
                PlaceId = dto.PlaceId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _reviewService.AddReviewAsync(review);

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
            var deleted = await _reviewService.DeleteReviewAsync(id);

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