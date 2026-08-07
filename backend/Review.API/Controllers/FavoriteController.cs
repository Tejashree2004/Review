using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoriteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoriteController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================
        // Add Favorite
        // POST: api/favorite
        // ==========================

        [HttpPost]
        public async Task<IActionResult> AddFavorite(Favorite favorite)
        {
            bool exists = await _context.Favorites.AnyAsync(x =>
                x.UserId == favorite.UserId &&
                x.PlaceId == favorite.PlaceId);

            if (exists)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Already in favorites."
                });
            }

            _context.Favorites.Add(favorite);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Added to favorites."
            });
        }

        // ==========================
        // My Favorites
        // GET: api/favorite/user/1
        // ==========================

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Include(x => x.Place)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return Ok(favorites);
        }

        // ==========================
        // Remove Favorite
        // DELETE: api/favorite/1/2
        // ==========================

        [HttpDelete("{userId}/{placeId}")]
        public async Task<IActionResult> RemoveFavorite(int userId, int placeId)
        {
            var favorite = await _context.Favorites.FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.PlaceId == placeId);

            if (favorite == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Favorite not found."
                });
            }

            _context.Favorites.Remove(favorite);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Favorite removed."
            });
        }
    }
}