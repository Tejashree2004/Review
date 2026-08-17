using System.ComponentModel.DataAnnotations;

namespace Review.API.DTOs
{
    public class BusinessDto
    {
        // ==========================================
        // BASIC INFORMATION
        // ==========================================

        [Required]
        [MaxLength(150)]
        public string BusinessName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string BusinessType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // ==========================================
        // LOCATION
        // ==========================================

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Pincode { get; set; } = string.Empty;

        // ==========================================
        // CONTACT
        // ==========================================

        [Required]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Website { get; set; } = string.Empty;

        // ==========================================
        // OPENING HOURS
        // ==========================================

        public string OpeningTime { get; set; } = string.Empty;

        public string ClosingTime { get; set; } = string.Empty;

        public string WorkingDays { get; set; } = "Monday - Sunday";
    }
}