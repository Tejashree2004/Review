namespace Review.API.DTOs;

public class ProfileDto
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public bool IsEmailVerified { get; set; }

    public DateTime CreatedAt { get; set; }
}