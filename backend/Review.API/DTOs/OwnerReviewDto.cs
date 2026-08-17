namespace Review.API.DTOs
{
    public class OwnerReviewDto
    {
        public int ReviewId { get; set; }

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public int PlaceId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public string? OwnerReply { get; set; }
    }
}