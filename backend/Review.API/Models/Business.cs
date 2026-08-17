using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Review.API.Models;

public class Business
{
    [Key]
    public int BusinessId { get; set; }

    // ==========================================
    // BUSINESS OWNER
    // ==========================================

    [Required]
    public int OwnerId { get; set; }

    [ForeignKey(nameof(OwnerId))]
    public User? Owner { get; set; }

    // ==========================================
    // CATEGORY
    // ==========================================

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category? Category { get; set; }

    // ==========================================
    // BASIC BUSINESS INFORMATION
    // ==========================================

    [Required]
    [MaxLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    // ==========================================
    // CONTACT INFORMATION
    // ==========================================

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    // ==========================================
    // LOCATION
    // ==========================================

    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Pincode { get; set; } = string.Empty;

    // ==========================================
    // BUSINESS DETAILS
    // ==========================================

    [MaxLength(500)]
    public string Website { get; set; } = string.Empty;

    [MaxLength(100)]
    public string OpeningTime { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ClosingTime { get; set; } = string.Empty;

    public bool IsOpen { get; set; } = true;

    // ==========================================
    // STATUS
    // ==========================================

    public bool IsApproved { get; set; } = false;

    public bool IsActive { get; set; } = true;

    // ==========================================
    // RATING
    // ==========================================

    public double Rating { get; set; } = 0;

    public int ReviewCount { get; set; } = 0;

    // ==========================================
    // TIMESTAMPS
    // ==========================================

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // ==========================================
    // PHOTOS
    // ==========================================

    public ICollection<BusinessPhoto> Photos { get; set; }
        = new List<BusinessPhoto>();
}