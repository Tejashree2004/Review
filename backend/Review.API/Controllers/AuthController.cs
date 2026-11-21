
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Helpers;
using Review.API.Models;
using Review.API.Services;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;

namespace Review.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthController(
        AppDbContext context,
        JwtService jwtService,
        IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    // =====================================================
    // SEND EMAIL OTP
    // POST: api/auth/send-email-otp
    // =====================================================

    [HttpPost("send-email-otp")]
    public async Task<IActionResult> SendEmailOtp(
        [FromBody] SendEmailOtpDto dto)
    {
        if (dto == null ||
            dto.UserId <= 0 ||
            string.IsNullOrWhiteSpace(dto.Email))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Invalid OTP request."
            });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == dto.UserId);

        if (user == null)
        {
            return NotFound(new ApiResponse
            {
                Success = false,
                Message = "User not found."
            });
        }

        if (!user.Email.Equals(
            dto.Email.Trim(),
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Email does not match the registered account."
            });
        }

        if (user.IsEmailVerified)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Email is already verified."
            });
        }

        try
        {
            await GenerateAndSendOtpAsync(user);

            return Ok(new ApiResponse
            {
                Success = true,
                Message = "OTP sent successfully.",
                Data = new
                {
                    Email = MaskEmail(user.Email),
                    ExpiryMinutes = 10
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"OTP email sending failed: {ex.Message}");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new ApiResponse
                {
                    Success = false,
                    Message = "Unable to send OTP email. Please try again."
                });
        }
    }

    // =====================================================
    // VERIFY EMAIL OTP
    // POST: api/auth/verify-email-otp
    // =====================================================

    [HttpPost("verify-email-otp")]
    public async Task<IActionResult> VerifyEmailOtp(
        [FromBody] VerifyEmailOtpDto dto)
    {
        if (dto == null ||
            dto.UserId <= 0 ||
            string.IsNullOrWhiteSpace(dto.Otp))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Please enter the OTP."
            });
        }

        var enteredOtp = dto.Otp.Trim();

        if (enteredOtp.Length != 6 ||
            !enteredOtp.All(char.IsDigit))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "OTP must be a 6-digit number."
            });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == dto.UserId);

        if (user == null)
        {
            return NotFound(new ApiResponse
            {
                Success = false,
                Message = "User not found."
            });
        }

        if (user.IsEmailVerified)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Email is already verified."
            });
        }

        var otpEntry = await _context.EmailOtps
            .Where(x =>
                x.UserId == dto.UserId &&
                !x.IsUsed &&
                x.ExpiryTime > DateTime.UtcNow)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpEntry == null)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "OTP has expired. Please request a new OTP."
            });
        }

        if (!otpEntry.Otp.Equals(
            enteredOtp,
            StringComparison.Ordinal))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Invalid OTP. Please try again."
            });
        }

        otpEntry.IsUsed = true;
        user.IsEmailVerified = true;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Email verified successfully."
        });
    }

    // =====================================================
    // REGISTER
    // POST: api/auth/register
    // =====================================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterDto dto)
    {
        if (dto == null || !ModelState.IsValid)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Please provide valid registration details."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.FullName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.MobileNumber) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "All required fields must be filled."
            });
        }

        var email = dto.Email.Trim().ToLowerInvariant();
        var mobileNumber = dto.MobileNumber.Trim();

        // ---------------------------------------------
        // CHECK EXISTING EMAIL
        // ---------------------------------------------

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.Email.ToLower() == email);

        if (existingUser != null)
        {
            // Already verified account
            if (existingUser.IsEmailVerified)
            {
                return BadRequest(new ApiResponse
                {
                    Success = false,
                    Message = "Email already exists."
                });
            }

            // Existing but unverified account:
            // Generate a fresh OTP for the same account.
            try
            {
                await GenerateAndSendOtpAsync(existingUser);

                return Ok(new ApiResponse
                {
                    Success = true,
                    Message = "Your account already exists but email verification is pending. A new OTP has been sent.",
                    Data = new
                    {
                        UserId = existingUser.Id,
                        FullName = existingUser.FullName,
                        Email = existingUser.Email,
                        Role = existingUser.Role,
                        RequiresEmailVerification = true,
                        IsEmailVerified = false
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Existing account OTP email failed: {ex.Message}");

                // Account already exists.
                // Send UserId and Email so frontend can open OTP page.
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new ApiResponse
                    {
                        Success = false,
                        Message = "Your account exists, but OTP email could not be sent. Please try Resend OTP.",
                        Data = new
                        {
                            UserId = existingUser.Id,
                            FullName = existingUser.FullName,
                            Email = existingUser.Email,
                            Role = existingUser.Role,
                            RequiresEmailVerification = true
                        }
                    });
            }
        }

        // ---------------------------------------------
        // CHECK EXISTING MOBILE NUMBER
        // ---------------------------------------------

        var mobileExists = await _context.Users
            .AnyAsync(x => x.MobileNumber == mobileNumber);

        if (mobileExists)
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Mobile number already exists."
            });
        }

        // ---------------------------------------------
        // VALIDATE ROLE
        // ---------------------------------------------

        var role = string.IsNullOrWhiteSpace(dto.Role)
            ? "Reviewer"
            : dto.Role.Trim();

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

        // ---------------------------------------------
        // CREATE NEW USER
        // ---------------------------------------------

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            MobileNumber = mobileNumber,
            PasswordHash = PasswordHasher.HashPassword(dto.Password),
            Role = role,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // ---------------------------------------------
        // GENERATE AND SEND OTP
        // ---------------------------------------------

        try
        {
            await GenerateAndSendOtpAsync(user);

            return Ok(new ApiResponse
            {
                Success = true,
                Message = role == "Owner"
                    ? "Owner registration successful. OTP sent to your email."
                    : "Registration successful. OTP sent to your email.",
                Data = new
                {
                    UserId = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    MobileNumber = user.MobileNumber,
                    Role = user.Role,
                    IsEmailVerified = false,
                    RequiresEmailVerification = true
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Registration OTP email failed: {ex.Message}");

            // Account is already saved in database.
            // Return UserId and Email even if SMTP fails.
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new ApiResponse
                {
                    Success = false,
                    Message = "Account was created, but OTP email could not be sent. Please use Resend OTP.",
                    Data = new
                    {
                        UserId = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = user.Role,
                        RequiresEmailVerification = true
                    }
                });
        }
    }

    // =====================================================
    // LOGIN
    // POST: api/auth/login
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto)
    {
        if (dto == null || !ModelState.IsValid ||
            string.IsNullOrWhiteSpace(dto.EmailOrMobile) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new ApiResponse
            {
                Success = false,
                Message = "Please provide email/mobile and password."
            });
        }

        var loginValue = dto.EmailOrMobile.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(x =>
                x.Email.ToLower() == loginValue.ToLower() ||
                x.MobileNumber == loginValue);

        if (user == null)
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Invalid email/mobile or password."
            });
        }

        var passwordValid = PasswordHasher.VerifyPassword(
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

        if (!user.IsEmailVerified)
        {
            return Unauthorized(new ApiResponse
            {
                Success = false,
                Message = "Please verify your email before logging in.",
                Data = new
                {
                    RequiresEmailVerification = true,
                    UserId = user.Id,
                    Email = user.Email
                }
            });
        }

        var token = _jwtService.GenerateToken(user);

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

    // =====================================================
    // GENERATE SECURE 6-DIGIT OTP
    // =====================================================

    private static string GenerateOtp()
    {
        var randomNumber = RandomNumberGenerator.GetInt32(
            100000,
            1000000);

        return randomNumber.ToString();
    }

    // =====================================================
    // GENERATE OTP, SAVE AND SEND EMAIL
    // =====================================================

    private async Task GenerateAndSendOtpAsync(User user)
    {
        // Mark previous unused OTPs as used.
        var oldOtps = await _context.EmailOtps
            .Where(x =>
                x.UserId == user.Id &&
                !x.IsUsed)
            .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.IsUsed = true;
        }

        var now = DateTime.UtcNow;
        var otp = GenerateOtp();

        var emailOtp = new EmailOtp
        {
            UserId = user.Id,
            Otp = otp,
            ExpiryTime = now.AddMinutes(10),
            IsUsed = false,
            CreatedAt = now
        };

        _context.EmailOtps.Add(emailOtp);

        await _context.SaveChangesAsync();

        // Keep the OTP record if SMTP fails.
        // A later resend will invalidate it and generate a fresh one.
        await SendOtpEmailAsync(
            recipientEmail: user.Email,
            recipientName: user.FullName,
            otp: otp
        );
    }

    // =====================================================
    // SEND OTP EMAIL
    // =====================================================

    private async Task SendOtpEmailAsync(
        string recipientEmail,
        string recipientName,
        string otp)
    {
        var senderEmail =
            _configuration["EmailSettings:Email"];

        var appPassword =
            _configuration["EmailSettings:AppPassword"];

        var smtpServer =
            _configuration["EmailSettings:SmtpServer"];

        var smtpPortValue =
            _configuration["EmailSettings:Port"];

        if (string.IsNullOrWhiteSpace(senderEmail))
        {
            throw new Exception("EmailSettings:Email is missing.");
        }

        if (string.IsNullOrWhiteSpace(appPassword))
        {
            throw new Exception("EmailSettings:AppPassword is missing.");
        }

        if (string.IsNullOrWhiteSpace(smtpServer))
        {
            throw new Exception("EmailSettings:SmtpServer is missing.");
        }

        if (!int.TryParse(smtpPortValue, out var smtpPort))
        {
            throw new Exception("EmailSettings:Port is invalid.");
        }

        using var message = new MailMessage();

        message.From = new MailAddress(senderEmail, "REVIO");
        message.To.Add(new MailAddress(recipientEmail));
        message.Subject = "REVIO - Verify Your Email";
        message.IsBodyHtml = true;

        var safeName = WebUtility.HtmlEncode(recipientName);

        message.Body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8' />
    <meta name='viewport'
          content='width=device-width, initial-scale=1.0' />
</head>

<body style='
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
'>
    <div style='
        max-width:600px;
        margin:40px auto;
        background:#ffffff;
        border-radius:16px;
        padding:40px;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
    '>
        <div style='
            text-align:center;
            margin-bottom:30px;
        '>
            <h1 style='
                margin:0;
                color:#111111;
                font-size:32px;
            '>
                REVIO
            </h1>

            <p style='
                margin:8px 0 0;
                color:#888888;
                font-size:14px;
            '>
                Trusted Reviews Platform
            </p>
        </div>

        <p style='
            color:#333333;
            font-size:16px;
            line-height:1.6;
        '>
            Hello <strong>{safeName}</strong>,
        </p>

        <p style='
            color:#555555;
            font-size:15px;
            line-height:1.7;
        '>
            Thank you for creating your REVIO account.
            Use the verification code below to verify
            your email address.
        </p>

        <div style='
            text-align:center;
            margin:35px 0;
        '>
            <div style='
                display:inline-block;
                background:#111111;
                color:#ffffff;
                padding:18px 32px;
                border-radius:12px;
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
            '>
                {otp}
            </div>
        </div>

        <p style='
            color:#666666;
            font-size:14px;
            text-align:center;
        '>
            This OTP is valid for
            <strong>10 minutes</strong>.
        </p>

        <p style='
            color:#888888;
            font-size:13px;
            line-height:1.6;
            margin-top:25px;
        '>
            If you did not create this account,
            you can safely ignore this email.
        </p>

        <hr style='
            border:0;
            border-top:1px solid #eeeeee;
            margin:30px 0;
        '/>

        <p style='
            color:#aaaaaa;
            font-size:12px;
            text-align:center;
            margin:0;
        '>
            © {DateTime.UtcNow.Year} REVIO
        </p>
    </div>
</body>
</html>";

        using var smtpClient = new SmtpClient
        {
            Host = smtpServer,
            Port = smtpPort,

            // Port 587 uses STARTTLS.
            EnableSsl = true,

            UseDefaultCredentials = false,

            Credentials = new NetworkCredential(
                senderEmail,
                appPassword),

            DeliveryMethod = SmtpDeliveryMethod.Network,

            // SMTP timeout: 20 seconds.
            Timeout = 20000
        };

        await smtpClient.SendMailAsync(message);
    }

    // =====================================================
    // MASK EMAIL
    // =====================================================

    private static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return email;
        }

        var parts = email.Split('@');

        if (parts.Length != 2)
        {
            return email;
        }

        var username = parts[0];
        var domain = parts[1];

        if (username.Length <= 2)
        {
            return $"{username[0]}***@{domain}";
        }

        return $"{username[0]}***{username[^1]}@{domain}";
    }
}
