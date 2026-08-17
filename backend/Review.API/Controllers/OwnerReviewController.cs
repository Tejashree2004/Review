using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/owner/reviews")]
[Authorize]
public class OwnerReviewController : ControllerBase
{
    private readonly OwnerService _ownerService;

    public OwnerReviewController(OwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    // =====================================================
    // GET: api/owner/reviews/business/1
    // =====================================================

    [HttpGet("business/{businessId:int}")]
    public async Task<IActionResult> GetReviews(
        int businessId)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        var reviews =
            await _ownerService.GetOwnerReviewsAsync(
                businessId,
                ownerId);

        return Ok(new
        {
            Success = true,
            Message = "Reviews fetched successfully.",
            Data = reviews
        });
    }

    // =====================================================
    // POST: api/owner/reviews/5/reply
    // =====================================================

    [HttpPost("{reviewId:int}/reply")]
    public async Task<IActionResult> ReplyToReview(
        int reviewId,
        [FromBody] OwnerReplyDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        var result =
            await _ownerService.ReplyToReviewAsync(
                reviewId,
                ownerId,
                dto);

        if (result == null)
        {
            return NotFound(new
            {
                Success = false,
                Message = "Review not found or you are not authorized."
            });
        }

        return Ok(new
        {
            Success = true,
            Message = "Reply added successfully.",
            Data = result
        });
    }
}