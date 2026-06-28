using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs;

public class LoginDto
{
    [Required]
    public string EmailOrMobile { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}