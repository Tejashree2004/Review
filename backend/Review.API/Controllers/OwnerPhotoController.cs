using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/owner/photos")]
[Authorize]
public class OwnerPhotoController : ControllerBase
{
    private readonly OwnerService _ownerService;

    public OwnerPhotoController(OwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    // =====================================================
    // GET: /api/owner/photos/business/{businessId}
    // =====================================================

    [HttpGet("business/{businessId:int}")]
    public async Task<IActionResult> GetPhotos(int businessId)
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

        var photos =
            await _ownerService.GetOwnerPhotosAsync(
                businessId,
                ownerId
            );

        return Ok(new
        {
            Success = true,
            Message = "Business photos fetched successfully.",
            Data = photos
        });
    }

    // =====================================================
    // POST: /api/owner/photos/business/{businessId}
    // =====================================================

    [HttpPost("business/{businessId:int}")]
    public async Task<IActionResult> AddPhoto(
        int businessId,
        [FromBody] OwnerPhotoDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Invalid photo data.",
                Errors = ModelState
            });
        }

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

        var photo =
            await _ownerService.AddOwnerPhotoAsync(
                businessId,
                ownerId,
                dto
            );

        if (photo == null)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Business not found or you are not the owner."
            });
        }

        return Ok(new
        {
            Success = true,
            Message = "Business photo added successfully.",
            Data = photo
        });
    }

    // =====================================================
    // DELETE: /api/owner/photos/{photoId}
    // =====================================================

    [HttpDelete("{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(
        int photoId)
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

        var deleted =
            await _ownerService.DeleteOwnerPhotoAsync(
                photoId,
                ownerId
            );

        if (!deleted)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Photo not found or you are not the owner."
            });
        }

        return Ok(new
        {
            Success = true,
            Message = "Business photo deleted successfully."
        });
    }
}