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

    public AuthController(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    // ================= REGISTER =================

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Email already exists."
            });
        }

        if (await _context.Users.AnyAsync(x => x.MobileNumber == dto.MobileNumber))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Mobile number already exists."
            });
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            MobileNumber = dto.MobileNumber,
            PasswordHash = PasswordHasher.HashPassword(dto.Password)
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Registration Successful."
        });
    }

    // ================= LOGIN =================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x =>
            x.Email == dto.EmailOrMobile ||
            x.MobileNumber == dto.EmailOrMobile);

        if (user == null)
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Invalid credentials."
            });
        }

        if (!PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Invalid credentials."
            });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponseDto
{
    Success = true,
    Message = "Login Successful.",
    Token = token,
    UserId = user.Id
});
    }
}