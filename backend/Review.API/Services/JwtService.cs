using Microsoft.IdentityModel.Tokens;
using Review.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Review.API.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            // ==========================================
            // USER ID
            // ==========================================

            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()
            ),

            // ==========================================
            // EMAIL
            // ==========================================

            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email
            ),

            // ==========================================
            // FULL NAME
            // ==========================================

            new Claim(
                "FullName",
                user.FullName
            ),

            // ==========================================
            // ROLE
            // ==========================================

            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"]!
            )
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(
                    _configuration["Jwt:DurationInMinutes"]
                )
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}