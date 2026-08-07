using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs
{
    public class ReviewDto
    {
        [Required]
        public int PlaceId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(500)]
        public string Comment { get; set; } = string.Empty;
    }
}