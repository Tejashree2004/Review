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

        // =====================================================
        // ADD PLACE FAVORITE
        // POST: api/favorite
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> AddFavorite(Favorite favorite)
        {
            if (favorite.UserId <= 0)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "UserId is required."
                });
            }

            if (!favorite.PlaceId.HasValue)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "PlaceId is required for place favorite."
                });
            }

            bool exists = await _context.Favorites.AnyAsync(x =>
                x.UserId == favorite.UserId &&
                x.PlaceId == favorite.PlaceId &&
                x.BusinessId == null);

            if (exists)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Already in favorites."
                });
            }

            var placeExists = await _context.Places
                .AnyAsync(x => x.PlaceId == favorite.PlaceId.Value);

            if (!placeExists)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Place not found."
                });
            }

            var newFavorite = new Favorite
            {
                UserId = favorite.UserId,
                PlaceId = favorite.PlaceId,
                BusinessId = null
            };

            _context.Favorites.Add(newFavorite);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Added to favorites."
            });
        }

        // =====================================================
        // ADD BUSINESS FAVORITE
        // POST: api/favorite/business
        // =====================================================

        [HttpPost("business")]
        public async Task<IActionResult> AddBusinessFavorite(
            Favorite favorite)
        {
            if (favorite.UserId <= 0)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "UserId is required."
                });
            }

            if (!favorite.BusinessId.HasValue)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "BusinessId is required for business favorite."
                });
            }

            bool exists = await _context.Favorites.AnyAsync(x =>
                x.UserId == favorite.UserId &&
                x.BusinessId == favorite.BusinessId &&
                x.PlaceId == null);

            if (exists)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Business already in favorites."
                });
            }

            var businessExists = await _context.Businesses
                .AnyAsync(x =>
                    x.BusinessId == favorite.BusinessId.Value);

            if (!businessExists)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Business not found."
                });
            }

            var newFavorite = new Favorite
            {
                UserId = favorite.UserId,
                PlaceId = null,
                BusinessId = favorite.BusinessId
            };

            _context.Favorites.Add(newFavorite);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Business added to favorites."
            });
        }

        // =====================================================
        // MY FAVORITES
        // GET: api/favorite/user/1
        // =====================================================

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Include(x => x.Place)
                .Include(x => x.Business)
                    .ThenInclude(x => x.Category)
                .Include(x => x.Business)
                    .ThenInclude(x => x.Photos)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return Ok(favorites);
        }

        // =====================================================
        // REMOVE PLACE FAVORITE
        // DELETE: api/favorite/1/2
        // =====================================================

        [HttpDelete("{userId}/{placeId}")]
        public async Task<IActionResult> RemoveFavorite(
            int userId,
            int placeId)
        {
            var favorite =
                await _context.Favorites.FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.PlaceId == placeId &&
                    x.BusinessId == null);

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

        // =====================================================
        // REMOVE BUSINESS FAVORITE
        // DELETE: api/favorite/business/1/2
        // =====================================================

        [HttpDelete("business/{userId}/{businessId}")]
        public async Task<IActionResult> RemoveBusinessFavorite(
            int userId,
            int businessId)
        {
            var favorite =
                await _context.Favorites.FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.BusinessId == businessId &&
                    x.PlaceId == null);

            if (favorite == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "Business favorite not found."
                });
            }

            _context.Favorites.Remove(favorite);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Business favorite removed."
            });
        }
    }
}