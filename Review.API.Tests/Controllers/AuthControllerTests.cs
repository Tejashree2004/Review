using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Helpers;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class AuthControllerTests
{
    private static IConfiguration CreateConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "this-is-a-test-secret-key-with-at-least-32-characters",
            ["Jwt:Issuer"] = "REVIO-Test",
            ["Jwt:Audience"] = "REVIO-Test-Users",
            ["Jwt:DurationInMinutes"] = "60",

            ["EmailSettings:Email"] = "",
            ["EmailSettings:AppPassword"] = "",
            ["EmailSettings:SmtpServer"] = "",
            ["EmailSettings:Port"] = "587"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    private static AuthController CreateController(AppDbContext context)
    {
        var jwtService = new JwtService(CreateConfiguration());

        return new AuthController(
            context,
            jwtService,
            CreateConfiguration());
    }

    private static User CreateUser(
        int id = 1,
        string email = "test@example.com",
        string mobile = "9876543210",
        string password = "Password@123",
        bool verified = false,
        string role = "Reviewer")
    {
        return new User
        {
            Id = id,
            FullName = "Test User",
            Email = email,
            MobileNumber = mobile,
            PasswordHash = PasswordHasher.HashPassword(password),
            Role = role,
            IsEmailVerified = verified,
            CreatedAt = DateTime.UtcNow
        };
    }

    // =========================================================
    // SEND EMAIL OTP
    // =========================================================

    [Fact]
    public async Task SendEmailOtp_ShouldReturnBadRequest_WhenRequestIsInvalid()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new SendEmailOtpDto
        {
            UserId = 0,
            Email = ""
        };

        var result = await controller.SendEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task SendEmailOtp_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new SendEmailOtpDto
        {
            UserId = 999,
            Email = "test@example.com"
        };

        var result = await controller.SendEmailOtp(dto);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task SendEmailOtp_ShouldReturnBadRequest_WhenEmailDoesNotMatch()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new SendEmailOtpDto
        {
            UserId = 1,
            Email = "wrong@example.com"
        };

        var result = await controller.SendEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task SendEmailOtp_ShouldReturnBadRequest_WhenEmailAlreadyVerified()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(
            CreateUser(verified: true));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new SendEmailOtpDto
        {
            UserId = 1,
            Email = "test@example.com"
        };

        var result = await controller.SendEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task SendEmailOtp_ShouldRemoveOtp_WhenEmailSendingFails()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new SendEmailOtpDto
        {
            UserId = 1,
            Email = "test@example.com"
        };

        var result = await controller.SendEmailOtp(dto);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);

        Assert.Empty(context.EmailOtps);
    }

    // =========================================================
    // VERIFY EMAIL OTP
    // =========================================================

    [Fact]
    public async Task VerifyEmailOtp_ShouldReturnBadRequest_WhenOtpIsInvalidFormat()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 1,
            Otp = "123"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task VerifyEmailOtp_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 999,
            Otp = "123456"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task VerifyEmailOtp_ShouldReturnBadRequest_WhenUserAlreadyVerified()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser(verified: true));
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 1,
            Otp = "123456"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task VerifyEmailOtp_ShouldReturnBadRequest_WhenOtpDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 1,
            Otp = "123456"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task VerifyEmailOtp_ShouldReturnBadRequest_WhenOtpIsWrong()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());

        context.EmailOtps.Add(new EmailOtp
        {
            UserId = 1,
            Otp = "123456",
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 1,
            Otp = "654321"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task VerifyEmailOtp_ShouldVerifyUser_WhenOtpIsCorrect()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());

        context.EmailOtps.Add(new EmailOtp
        {
            UserId = 1,
            Otp = "123456",
            ExpiryTime = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new VerifyEmailOtpDto
        {
            UserId = 1,
            Otp = "123456"
        };

        var result = await controller.VerifyEmailOtp(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);

        var user = await context.Users.FindAsync(1);
        var otp = await context.EmailOtps.FirstAsync();

        Assert.NotNull(user);
        Assert.True(user.IsEmailVerified);
        Assert.True(otp.IsUsed);
    }

    // =========================================================
    // REGISTER
    // =========================================================

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenRequiredFieldsAreMissing()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "",
            Email = "",
            MobileNumber = "",
            Password = ""
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "Another User",
            Email = "TEST@EXAMPLE.COM",
            MobileNumber = "9999999999",
            Password = "Password@123",
            Role = "Reviewer"
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenMobileAlreadyExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(CreateUser());
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "Another User",
            Email = "another@example.com",
            MobileNumber = "9876543210",
            Password = "Password@123",
            Role = "Reviewer"
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenAdminRoleIsRequested()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "Admin User",
            Email = "admin@example.com",
            MobileNumber = "9999999999",
            Password = "Password@123",
            Role = "Admin"
        };

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Register_ShouldCreateReviewerAndOtp_WhenRoleIsDefault()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "New Reviewer",
            Email = "newreviewer@example.com",
            MobileNumber = "9999999999",
            Password = "Password@123",
            Role = ""
        };

        var result = await controller.Register(dto);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);

        var user = await context.Users
            .FirstOrDefaultAsync(x => x.Email == "newreviewer@example.com");

        Assert.NotNull(user);
        Assert.Equal("Reviewer", user.Role);
        Assert.False(user.IsEmailVerified);

        var otp = await context.EmailOtps
            .FirstOrDefaultAsync(x => x.UserId == user.Id);

        Assert.NotNull(otp);
        Assert.False(otp.IsUsed);
        Assert.Equal(6, otp.Otp.Length);
    }

    [Fact]
    public async Task Register_ShouldCreateOwner_WhenOwnerRoleIsRequested()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new RegisterDto
        {
            FullName = "Business Owner",
            Email = "owner@example.com",
            MobileNumber = "8888888888",
            Password = "Password@123",
            Role = "Owner"
        };

        var result = await controller.Register(dto);

        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);

        var user = await context.Users
            .FirstOrDefaultAsync(x => x.Email == "owner@example.com");

        Assert.NotNull(user);
        Assert.Equal("Owner", user.Role);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    [Fact]
    public async Task Login_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        controller.ModelState.AddModelError(
            "EmailOrMobile",
            "Required");

        var dto = new LoginDto
        {
            EmailOrMobile = "",
            Password = ""
        };

        var result = await controller.Login(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new LoginDto
        {
            EmailOrMobile = "unknown@example.com",
            Password = "Password@123"
        };

        var result = await controller.Login(dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorized.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsWrong()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(
            CreateUser(verified: true));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new LoginDto
        {
            EmailOrMobile = "test@example.com",
            Password = "WrongPassword"
        };

        var result = await controller.Login(dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorized.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldRequireEmailVerification_WhenEmailIsNotVerified()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(
            CreateUser(verified: false));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new LoginDto
        {
            EmailOrMobile = "test@example.com",
            Password = "Password@123"
        };

        var result = await controller.Login(dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorized.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldReturnSuccessAndJwt_WhenCredentialsAreValid()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(
            CreateUser(
                verified: true,
                role: "Reviewer"));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new LoginDto
        {
            EmailOrMobile = "test@example.com",
            Password = "Password@123"
        };

        var result = await controller.Login(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);

        var response = Assert.IsType<AuthResponseDto>(ok.Value);

        Assert.True(response.Success);
        Assert.Equal("Login successful.", response.Message);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
        Assert.Equal(1, response.UserId);
        Assert.Equal("Test User", response.FullName);
        Assert.Equal("test@example.com", response.Email);
        Assert.Equal("Reviewer", response.Role);
    }

    [Fact]
    public async Task Login_ShouldWorkWithMobileNumber()
    {
        using var context = TestDbContextFactory.Create();

        context.Users.Add(
            CreateUser(
                verified: true,
                role: "Owner"));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var dto = new LoginDto
        {
            EmailOrMobile = "9876543210",
            Password = "Password@123"
        };

        var result = await controller.Login(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);

        var response = Assert.IsType<AuthResponseDto>(ok.Value);

        Assert.True(response.Success);
        Assert.Equal("Owner", response.Role);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
    }
}

