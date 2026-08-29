namespace Review.API.DTOs
{
    public class UserPublicProfileDto
    {
        // =====================================================
        // USER PUBLIC PROFILE
        // =====================================================

        public UserPublicProfileInfoDto User { get; set; }
            = new UserPublicProfileInfoDto();

        // =====================================================
        // CLICKED REVIEW
        // =====================================================

        public UserPublicReviewDto Review { get; set; }
            = new UserPublicReviewDto();
    }

    // =========================================================
    // PUBLIC USER INFORMATION
    // =========================================================

    public class UserPublicProfileInfoDto
    {
        public int Id { get; set; }

        public string FullName { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; }
    }

    // =========================================================
    // CLICKED REVIEW INFORMATION
    // =========================================================

    public class UserPublicReviewDto
    {
        public int ReviewId { get; set; }

        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}