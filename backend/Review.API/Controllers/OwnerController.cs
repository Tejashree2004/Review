using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OwnerController : ControllerBase
{
    private readonly OwnerService _ownerService;

    public OwnerController(OwnerService ownerService)
    {
        _ownerService = ownerService;
    }

    // =====================================================
    // GET: api/owner/businesses
    // =====================================================

    [HttpGet("businesses")]
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
            await _ownerService
                .GetOwnerBusinessesAsync(ownerId);

        return Ok(new
        {
            Success = true,
            Message = "Owner businesses fetched successfully.",
            Data = businesses
        });
    }

    // =====================================================
    // GET: api/owner/businesses/5
    // =====================================================

    [HttpGet("businesses/{id:int}")]
    public async Task<IActionResult> GetMyBusiness(int id)
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
            await _ownerService
                .GetOwnerBusinessAsync(id, ownerId);

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
}