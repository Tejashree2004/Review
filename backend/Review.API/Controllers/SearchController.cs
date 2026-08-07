using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================
        // Search by Name
        // GET: api/search/place/pizza
        // ==========================

        [HttpGet("place/{keyword}")]
        public async Task<IActionResult> SearchPlace(string keyword)
        {
            var result = await _context.Places
                .Include(x => x.Category)
                .Where(x => x.Name.ToLower().Contains(keyword.ToLower()))
                .ToListAsync();

            return Ok(result);
        }

        // ==========================
        // Search by City
        // GET: api/search/city/pune
        // ==========================

        [HttpGet("city/{city}")]
        public async Task<IActionResult> SearchCity(string city)
        {
            var result = await _context.Places
                .Include(x => x.Category)
                .Where(x => x.City.ToLower() == city.ToLower())
                .ToListAsync();

            return Ok(result);
        }

        // ==========================
        // Search by Category
        // GET: api/search/category/Cafe
        // ==========================

        [HttpGet("category/{category}")]
        public async Task<IActionResult> SearchCategory(string category)
        {
            var result = await _context.Places
                .Include(x => x.Category)
                .Where(x => x.Category!.CategoryName.ToLower() == category.ToLower())
                .ToListAsync();

            return Ok(result);
        }

        // ==========================
        // Search Suggestions
        // GET: api/search/suggestions/pi
        // ==========================

        [HttpGet("suggestions/{keyword}")]
        public async Task<IActionResult> Suggestions(string keyword)
        {
            var result = await _context.Places
                .Where(x => x.Name.ToLower().Contains(keyword.ToLower()))
                .Select(x => x.Name)
                .Distinct()
                .Take(10)
                .ToListAsync();

            return Ok(result);
        }
    }
}