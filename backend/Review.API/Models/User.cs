using System.ComponentModel.DataAnnotations;

namespace Review.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        // ==========================================
        // USER INFORMATION
        // ==========================================

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // ==========================================
        // ROLE
        // ==========================================

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Reviewer";

        // ==========================================
        // EMAIL VERIFICATION
        // ==========================================

        public bool IsEmailVerified { get; set; } = false;

        // ==========================================
        // TIMESTAMPS
        // ==========================================

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}