using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================
        // Get User Profile
        // GET: api/profile/1
        // ==========================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        // ==========================
        // Update Profile
        // PUT: api/profile/1
        // ==========================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(
            int id,
            [FromBody] UpdateProfileRequest model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Profile data is required."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "User not found."
                });
            }

            // ==========================
            // Update only editable fields
            // ==========================

            if (!string.IsNullOrWhiteSpace(model.FullName))
            {
                user.FullName = model.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.Email))
            {
                user.Email = model.Email.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.MobileNumber))
            {
                user.MobileNumber = model.MobileNumber.Trim();
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Profile updated successfully.",
                data = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.MobileNumber,
                    user.UpdatedAt
                }
            });
        }

        // ==========================
        // My Reviews
        // GET: api/profile/1/reviews
        // ==========================

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> MyReviews(int id)
        {
            var reviews = await _context.Reviews
                .Include(x => x.Place)
                .Where(x => x.UserId == id)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }
    }

    // ==========================
    // Update Profile Request
    // ==========================

    public class UpdateProfileRequest
    {
        public string? FullName { get; set; }

        public string? Email { get; set; }

        public string? MobileNumber { get; set; }
    }
}