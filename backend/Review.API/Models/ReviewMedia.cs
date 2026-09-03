using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Review.API.Models
{
    public class ReviewMedia
    {
        [Key]
        public int ReviewMediaId { get; set; }

        // ==========================================
        // REVIEW
        // ==========================================

        [Required]
        public int ReviewId { get; set; }

        [ForeignKey(nameof(ReviewId))]
        public ReviewItem? Review { get; set; }

        // ==========================================
        // MEDIA URL
        // ==========================================

        [Required]
        [MaxLength(500)]
        public string MediaUrl { get; set; } = string.Empty;

        // ==========================================
        // MEDIA TYPE
        // image / video
        // ==========================================

        [Required]
        [MaxLength(20)]
        public string MediaType { get; set; } = string.Empty;

        // ==========================================
        // CREATED DATE
        // ==========================================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;
    }
}