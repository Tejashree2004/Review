using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

namespace Review.API.Services
{
    public class HomeService
    {
        private readonly AppDbContext _context;

        public HomeService(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // Get All Categories
        // ==========================================

        public async Task<List<Category>> GetCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.CategoryName)
                .ToListAsync();
        }

        // ==========================================
        // Get Top Rated Places
        // ==========================================

        public async Task<List<Place>> GetTopRatedPlacesAsync()
        {
            return await _context.Places
                .Include(p => p.Category)
                .OrderByDescending(p => p.Rating)
                .Take(10)
                .ToListAsync();
        }

        // ==========================================
        // Get Place Details
        // ==========================================

        public async Task<Place?> GetPlaceAsync(int id)
        {
            return await _context.Places
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.PlaceId == id);
        }
    }
}