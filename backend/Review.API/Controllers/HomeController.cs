using Microsoft.AspNetCore.Mvc;
using Review.API.Services;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        private readonly HomeService _homeService;

        public HomeController(HomeService homeService)
        {
            _homeService = homeService;
        }

        // ==========================================
        // GET : api/Home/categories
        // ==========================================

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _homeService.GetCategoriesAsync();

            return Ok(categories);
        }

        // ==========================================
        // GET : api/Home/toprated
        // ==========================================

        [HttpGet("toprated")]
        public async Task<IActionResult> GetTopRatedPlaces()
        {
            var places = await _homeService.GetTopRatedPlacesAsync();

            return Ok(places);
        }

        // ==========================================
        // GET : api/Home/place/5
        // ==========================================

        [HttpGet("place/{id}")]
        public async Task<IActionResult> GetPlace(int id)
        {
            var place = await _homeService.GetPlaceAsync(id);

            if (place == null)
                return NotFound();

            return Ok(place);
        }

        // ==========================================
        // GET : api/Home/summary
        // ==========================================

        [HttpGet("summary")]
        public IActionResult GetSummary()
        {
            return Ok(new
            {
                Food = "Excellent",
                Service = "Very Good",
                Cleanliness = "Excellent",
                Parking = "Available"
            });
        }
    }
}