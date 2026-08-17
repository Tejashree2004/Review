using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/owner/business")]
[Authorize]
public class OwnerBusinessController : ControllerBase
{
    private readonly OwnerService _ownerService;

    public OwnerBusinessController(OwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    // =====================================================
    // GET: api/owner/business
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetMyBusinesses()
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

        var businesses =
            await _ownerService.GetOwnerBusinessesAsync(ownerId);

        return Ok(new
        {
            Success = true,
            Message = "Businesses fetched successfully.",
            Data = businesses
        });
    }

    // =====================================================
    // GET: api/owner/business/5
    // =====================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBusiness(int id)
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

        var business =
            await _ownerService.GetOwnerBusinessAsync(
                id,
                ownerId);

        if (business == null)
        {
            return NotFound(new
            {
                Success = false,
                Message = "Business not found."
            });
        }

        return Ok(new
        {
            Success = true,
            Message = "Business fetched successfully.",
            Data = business
        });
    }

    // =====================================================
    // POST: api/owner/business
    // =====================================================

    [HttpPost]
    public async Task<IActionResult> CreateBusiness(
        [FromBody] CreateBusinessDto dto)
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

        var business =
            await _ownerService.CreateBusinessAsync(
                ownerId,
                dto);

        return Ok(new
        {
            Success = true,
            Message = "Business created successfully.",
            Data = business
        });
    }

    // =====================================================
    // PUT: api/owner/business/5
    // =====================================================

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBusiness(
        int id,
        [FromBody] UpdateBusinessDto dto)
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

        var business =
            await _ownerService.UpdateBusinessAsync(
                id,
                ownerId,
                dto);

        if (business == null)
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
            Message = "Business updated successfully.",
            Data = business
        });
    }

    // =====================================================
    // DELETE: api/owner/business/5
    // =====================================================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBusiness(int id)
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
            await _ownerService.DeleteBusinessAsync(
                id,
                ownerId);

        if (!deleted)
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
            Message = "Business deleted successfully."
        });
    }
}