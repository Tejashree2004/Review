using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

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
                return NotFound("User not found.");

            return Ok(user);
        }

        // ==========================
        // Update Profile
        // PUT: api/profile/1
        // ==========================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, User model)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("User not found.");

            user.FullName = model.FullName;
            user.Email = model.Email;
            user.MobileNumber = model.MobileNumber;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Profile updated successfully."
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
}