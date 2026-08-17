using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs;

public class CreateBusinessDto
{
    [Required]
    [MaxLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Pincode { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Website { get; set; } = string.Empty;

    [MaxLength(100)]
    public string OpeningTime { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ClosingTime { get; set; } = string.Empty;
}