namespace Review.API.DTOs
{
    public class PlaceDto
    {
        public int PlaceId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public double Rating { get; set; }

        public int ReviewCount { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
    }
}