using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Review.API.Models
{
    public class Place
    {
        [Key]
        public int PlaceId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [ForeignKey("Category")]
        public int CategoryId { get; set; }

        public Category? Category { get; set; }

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public double Rating { get; set; }

        public int ReviewCount { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool OpenStatus { get; set; }
    }
}