namespace Review.API.Models;

public class EmailOtp
{
    public int EmailOtpId { get; set; }

    public int UserId { get; set; }

    public string Otp { get; set; } = string.Empty;

    public DateTime ExpiryTime { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}