using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/business/{businessId:int}/photos")]
public class BusinessPhotoController : ControllerBase
{
    private readonly BusinessService _businessService;

    public BusinessPhotoController(BusinessService businessService)
    {
        _businessService = businessService;
    }

    // =====================================================
    // GET: api/business/1/photos
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetPhotos(int businessId)
    {
        var photos =
            await _businessService.GetBusinessPhotosAsync(businessId);

        return Ok(new
        {
            Success = true,
            Message = "Business photos fetched successfully.",
            Data = photos
        });
    }

    // =====================================================
    // POST: api/business/1/photos
    // =====================================================

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddPhoto(
        int businessId,
        [FromBody] BusinessPhotoDto dto)
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

        var photo =
            await _businessService.AddBusinessPhotoAsync(
                businessId,
                ownerId,
                dto);

        if (photo == null)
        {
            return NotFound(new
            {
                Success = false,
                Message = "Business not found or you are not the owner."
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
    // DELETE: api/business/1/photos/5
    // =====================================================

    [Authorize]
    [HttpDelete("{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(
        int businessId,
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
            await _businessService.DeleteBusinessPhotoAsync(
                businessId,
                photoId,
                ownerId);

        if (!deleted)
        {
            return NotFound(new
            {
                Success = false,
                Message = "Photo not found or you are not the owner."
            });
        }

        return Ok(new
        {
            Success = true,
            Message = "Business photo deleted successfully."
        });
    }
}