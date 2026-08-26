namespace Review.API.DTOs
{
    public class ReviewPaginationDto
    {
        // =====================================================
        // REVIEWS
        // =====================================================

        public List<ReviewItemDto> Reviews { get; set; }
            = new List<ReviewItemDto>();

        // =====================================================
        // PAGINATION
        // =====================================================

        public int TotalReviews { get; set; }

        public int Page { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }

        public bool HasMore { get; set; }

        // =====================================================
        // RATING SUMMARY
        // =====================================================

        public double AverageRating { get; set; }

        public int FiveStarCount { get; set; }

        public int FourStarCount { get; set; }

        public int ThreeStarCount { get; set; }

        public int TwoStarCount { get; set; }

        public int OneStarCount { get; set; }
    }

    public class ReviewItemDto
    {
        // =====================================================
        // REVIEW
        // =====================================================

        public int ReviewId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; }

        // =====================================================
        // REVIEWER
        // =====================================================

        public int UserId { get; set; }

        public string? UserName { get; set; }

        // =====================================================
        // PLACE
        // =====================================================

        public int? PlaceId { get; set; }

        public string? PlaceName { get; set; }

        // =====================================================
        // BUSINESS
        // =====================================================

        public int? BusinessId { get; set; }

        public string? BusinessName { get; set; }

        // =====================================================
        // OWNER REPLY
        // =====================================================

        public string? OwnerReply { get; set; }

        public DateTime? OwnerReplyAt { get; set; }
    }
}