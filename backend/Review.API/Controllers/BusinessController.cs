using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusinessController : ControllerBase
{
    private readonly BusinessService _businessService;

    public BusinessController(BusinessService businessService)
    {
        _businessService = businessService;
    }

    // =====================================================
    // GET: api/business
    // Get all approved public businesses
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetBusinesses()
    {
        var businesses =
            await _businessService.GetPublicBusinessesAsync();

        return Ok(new
        {
            Success = true,
            Message = "Businesses fetched successfully.",
            Data = businesses
        });
    }

    // =====================================================
    // GET: api/business/5
    // Get business details
    // =====================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBusiness(int id)
    {
        var business =
            await _businessService.GetBusinessByIdAsync(id);

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
    // GET:
    // api/business/category/1
    // =====================================================

    [HttpGet("category/{categoryId:int}")]
    public async Task<IActionResult> GetByCategory(
        int categoryId)
    {
        var businesses =
            await _businessService
                .GetBusinessesByCategoryAsync(categoryId);

        return Ok(new
        {
            Success = true,
            Message = "Businesses fetched successfully.",
            Data = businesses
        });
    }

    // =====================================================
    // GET:
    // api/business/search?query=pizza
    // =====================================================

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string query)
    {
        var businesses =
            await _businessService
                .SearchBusinessesAsync(query);

        return Ok(new
        {
            Success = true,
            Message = "Search completed successfully.",
            Data = businesses
        });
    }

    // =====================================================
    // POST: api/business
    // Owner creates business
    // =====================================================

    [Authorize]
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
            await _businessService
                .CreateBusinessAsync(ownerId, dto);

        return Ok(new
        {
            Success = true,
            Message = "Business created successfully. Waiting for approval.",
            Data = business
        });
    }

    // =====================================================
    // PUT: api/business/5
    // Owner updates business
    // =====================================================

    [Authorize]
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
            await _businessService
                .UpdateBusinessAsync(
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
    // DELETE: api/business/5
    // =====================================================

    [Authorize]
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
            await _businessService
                .DeleteBusinessAsync(id, ownerId);

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