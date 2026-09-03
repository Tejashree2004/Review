namespace Review.API.DTOs
{
    public class ReviewMediaDto
    {
        public int ReviewMediaId { get; set; }

        public string MediaUrl { get; set; } = string.Empty;

        public string MediaType { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}