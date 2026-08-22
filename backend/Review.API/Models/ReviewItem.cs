using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Review.API.Models
{
    public class ReviewItem
    {
        [Key]
        public int ReviewId { get; set; }

        // ==========================================
        // RATING
        // ==========================================

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        // ==========================================
        // COMMENT
        // ==========================================

        [Required]
        public string Comment { get; set; } = string.Empty;

        // ==========================================
        // CREATED DATE
        // ==========================================

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ==========================================
        // REVIEWER
        // ==========================================

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        // ==========================================
        // EXISTING PLACE REVIEW
        // ==========================================

        public int? PlaceId { get; set; }

        [ForeignKey(nameof(PlaceId))]
        public Place? Place { get; set; }

        // ==========================================
        // BUSINESS REVIEW
        // ==========================================

        public int? BusinessId { get; set; }

        [ForeignKey(nameof(BusinessId))]
        public Business? Business { get; set; }

        // ==========================================
        // OWNER REPLY
        // ==========================================

        public string? OwnerReply { get; set; }

        public DateTime? OwnerReplyAt { get; set; }
    }
}