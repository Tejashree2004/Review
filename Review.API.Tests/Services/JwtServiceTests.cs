using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Review.API.Models;
using Review.API.Services;

namespace Review.API.Tests.Services;

public class JwtServiceTests
{
    private static IConfiguration CreateConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "ThisIsAVeryStrongSecretKeyForTesting123456789",
            ["Jwt:Issuer"] = "ReviewAPI",
            ["Jwt:Audience"] = "ReviewClient",
            ["Jwt:DurationInMinutes"] = "60"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    [Fact]
    public void GenerateToken_ShouldReturnValidJwtToken()
    {
        var configuration = CreateConfiguration();
        var service = new JwtService(configuration);

        var user = new User
        {
            Id = 1,
            FullName = "Test User",
            Email = "test@example.com",
            MobileNumber = "9876543210",
            PasswordHash = "hashed-password",
            Role = "Reviewer"
        };

        var token = service.GenerateToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal("1", jwt.Claims.First(x => x.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("test@example.com", jwt.Claims.First(x => x.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal("Test User", jwt.Claims.First(x => x.Type == "FullName").Value);
        Assert.Equal("Reviewer", jwt.Claims.First(x => x.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public void GenerateToken_ShouldContainCorrectIssuerAndAudience()
    {
        var configuration = CreateConfiguration();
        var service = new JwtService(configuration);

        var user = new User
        {
            Id = 2,
            FullName = "Owner User",
            Email = "owner@example.com",
            MobileNumber = "9876543211",
            PasswordHash = "hashed-password",
            Role = "BusinessOwner"
        };

        var token = service.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal("ReviewAPI", jwt.Issuer);
        Assert.Contains("ReviewClient", jwt.Audiences);
    }

    [Fact]
    public void GenerateToken_ShouldSetExpirationTime()
    {
        var configuration = CreateConfiguration();
        var service = new JwtService(configuration);

        var user = new User
        {
            Id = 3,
            FullName = "Admin User",
            Email = "admin@example.com",
            MobileNumber = "9876543212",
            PasswordHash = "hashed-password",
            Role = "Admin"
        };

        var before = DateTime.UtcNow.AddMinutes(59);

        var token = service.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        var expiration = jwt.ValidTo;

        Assert.True(expiration > before);
        Assert.True(expiration <= DateTime.UtcNow.AddMinutes(61));
    }
}
