namespace Review.API.DTOs;

public class SendEmailOtpDto
{
    public int UserId { get; set; }

    public string Email { get; set; } = string.Empty;
}