using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs
{
    public class OwnerReplyDto
    {
        [Required]
        public int ReviewId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Reply { get; set; } = string.Empty;
    }
}