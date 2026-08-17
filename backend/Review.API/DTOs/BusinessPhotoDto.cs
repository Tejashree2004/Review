namespace Review.API.DTOs;

public class BusinessPhotoDto
{
    public int BusinessPhotoId { get; set; }

    public int BusinessId { get; set; }

    public string PhotoUrl { get; set; } = string.Empty;

    public string Caption { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }

    public DateTime CreatedAt { get; set; }
}