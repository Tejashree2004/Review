using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Helpers;
using Review.API.Models;
using Review.API.Services;

namespace Review.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(
        AppDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    // =====================================================
    // REGISTER
    // POST: api/auth/register
    // =====================================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Please provide valid registration details."
            });
        }

        // =================================================
        // Normalize Email
        // =================================================

        var email = dto.Email.Trim().ToLower();

        var mobileNumber = dto.MobileNumber.Trim();

        // =================================================
        // Check Email
        // =================================================

        if (await _context.Users.AnyAsync(
            x => x.Email.ToLower() == email))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Email already exists."
            });
        }

        // =================================================
        // Check Mobile
        // =================================================

        if (await _context.Users.AnyAsync(
            x => x.MobileNumber == mobileNumber))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Mobile number already exists."
            });
        }

        // =================================================
        // SECURITY
        // =================================================
        // Normal registration can create only Reviewer
        // or Owner.
        //
        // Admin accounts cannot be created directly from
        // public registration.
        // =================================================

        var role = dto.Role.Trim();

        if (role.Equals(
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Admin registration is not allowed."
            });
        }

        if (!role.Equals(
                "Owner",
                StringComparison.OrdinalIgnoreCase))
        {
            role = "Reviewer";
        }

        // =================================================
        // Create User
        // =================================================

        var user = new User
        {
            FullName = dto.FullName.Trim(),

            Email = email,

            MobileNumber = mobileNumber,

            PasswordHash =
                PasswordHasher.HashPassword(dto.Password),

            Role = role,

            IsEmailVerified = false,

            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        // =================================================
        // Response
        // =================================================

        return Ok(new ApiResponse
        {
            Success = true,

            Message =
                role == "Owner"
                    ? "Owner registration successful."
                    : "Registration successful.",

            Data = new
            {
                UserId = user.Id,
                user.FullName,
                user.Email,
                user.MobileNumber,
                user.Role
            }
        });
    }

    // =====================================================
    // LOGIN
    // POST: api/auth/login
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Please provide email/mobile and password."
            });
        }

        // =================================================
        // Find User
        // =================================================

        var loginValue = dto.EmailOrMobile.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.Email.ToLower() == loginValue.ToLower()
                ||
                x.MobileNumber == loginValue);

        // =================================================
        // User Not Found
        // =================================================

        if (user == null)
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Invalid email/mobile or password."
            });
        }

        // =================================================
        // Verify Password
        // =================================================

        var passwordValid =
            PasswordHasher.VerifyPassword(
                dto.Password,
                user.PasswordHash);

        if (!passwordValid)
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Invalid email/mobile or password."
            });
        }

        // =================================================
        // Generate JWT
        // =================================================

        var token =
            _jwtService.GenerateToken(user);

        // =================================================
        // Response
        // =================================================

        return Ok(new AuthResponseDto
        {
            Success = true,

            Message = "Login successful.",

            Token = token,

            UserId = user.Id,

            FullName = user.FullName,

            Email = user.Email,

            Role = user.Role
        });
    }
}