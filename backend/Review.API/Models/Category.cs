using System.ComponentModel.DataAnnotations;

namespace Review.API.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; } = string.Empty;

        public string Icon { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;
    }
}