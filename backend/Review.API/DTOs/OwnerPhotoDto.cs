using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs;

public class OwnerPhotoDto
{
    [Required]
    [MaxLength(1000)]
    public string PhotoUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Caption { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }
}