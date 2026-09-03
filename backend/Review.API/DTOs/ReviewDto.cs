using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Review.API.DTOs
{
    public class ReviewDto
    {
        // =====================================================
        // REVIEWER
        // =====================================================

        [Required]
        public int UserId { get; set; }

        // =====================================================
        // EXISTING PLACE
        // Optional when reviewing a Business
        // =====================================================

        public int? PlaceId { get; set; }

        // =====================================================
        // BUSINESS
        // Optional when reviewing a Place
        // =====================================================

        public int? BusinessId { get; set; }

        // =====================================================
        // RATING
        // =====================================================

        [Range(1, 5)]
        public int Rating { get; set; }

        // =====================================================
        // COMMENT
        // =====================================================

        [Required]
        [MaxLength(500)]
        public string Comment { get; set; } = string.Empty;

        // =====================================================
        // PHOTOS / VIDEOS
        // =====================================================

        public List<IFormFile>? Media { get; set; }
    }
}