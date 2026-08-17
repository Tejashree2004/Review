namespace Review.API.DTOs;

public class OwnerBusinessDto
{
    public int BusinessId { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Pincode { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public string OpeningTime { get; set; } = string.Empty;

    public string ClosingTime { get; set; } = string.Empty;

    public bool IsOpen { get; set; }

    public bool IsApproved { get; set; }

    public bool IsActive { get; set; }

    public double Rating { get; set; }

    public int ReviewCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<BusinessPhotoDto> Photos { get; set; }
        = new List<BusinessPhotoDto>();
}