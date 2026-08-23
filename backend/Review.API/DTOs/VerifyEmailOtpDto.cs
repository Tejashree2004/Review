namespace Review.API.DTOs;

public class VerifyEmailOtpDto
{
    public int UserId { get; set; }

    public string Otp { get; set; } = string.Empty;
}