using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Review.API.Models;

public class BusinessPhoto
{
    [Key]
    public int BusinessPhotoId { get; set; }

    // ==========================================
    // BUSINESS
    // ==========================================

    [Required]
    public int BusinessId { get; set; }

    [ForeignKey(nameof(BusinessId))]
    [JsonIgnore]
    public Business? Business { get; set; }

    // ==========================================
    // PHOTO
    // ==========================================

    [Required]
    public string PhotoUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Caption { get; set; } = string.Empty;

    // ==========================================
    // PRIMARY PHOTO
    // ==========================================

    public bool IsPrimary { get; set; } = false;

    // ==========================================
    // TIMESTAMP
    // ==========================================

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}