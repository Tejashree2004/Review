using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs;

public class OwnerPhotoDto
{
    [Required]
    public IFormFile Photo { get; set; } = null!;

    [MaxLength(200)]
    public string Caption { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }
}