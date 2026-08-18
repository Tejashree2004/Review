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

        // =====================================================
        // SEARCH BY NAME / KEYWORD
        // GET: api/search/place/pizza
        //
        // Searches:
        // 1. Existing Places
        // 2. Owner-created Businesses
        //
        // Supports:
        // - Normal search
        // - Partial word search
        // - City
        // - Address
        // - Category
        // - Abbreviations
        //
        // Example:
        // "The Food Corner" -> "food", "corner", "the"
        // "The Food Corner" -> "tfc"
        // =====================================================

        [HttpGet("place/{keyword}")]
        public async Task<IActionResult> SearchPlace(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return Ok(new
                {
                    Places = new List<object>(),
                    Businesses = new List<object>()
                });
            }

            keyword = keyword.Trim();

            var searchKeyword = keyword.ToLower();

            // =================================================
            // SEARCH EXISTING PLACES
            // =================================================

            var places = await _context.Places
                .Include(x => x.Category)
                .Where(x =>
                    x.Name.ToLower().Contains(searchKeyword)

                    ||

                    x.City.ToLower().Contains(searchKeyword)

                    ||

                    x.Address.ToLower().Contains(searchKeyword)

                    ||

                    (
                        x.Category != null &&
                        x.Category.CategoryName
                            .ToLower()
                            .Contains(searchKeyword)
                    )
                )
                .OrderByDescending(x => x.Rating)
                .ToListAsync();

            // =================================================
            // SEARCH OWNER BUSINESSES
            // =================================================

            var businesses = await _context.Businesses
                .Include(x => x.Category)
                .Include(x => x.Photos)
                .Where(x =>
                    x.IsActive &&
                    x.IsApproved &&
                    (
                        x.BusinessName.ToLower()
                            .Contains(searchKeyword)

                        ||

                        x.City.ToLower()
                            .Contains(searchKeyword)

                        ||

                        x.Address.ToLower()
                            .Contains(searchKeyword)

                        ||

                        (
                            x.Category != null &&
                            x.Category.CategoryName
                                .ToLower()
                                .Contains(searchKeyword)
                        )
                    )
                )
                .OrderByDescending(x => x.Rating)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync();

            // =================================================
            // ABBREVIATION SEARCH
            //
            // Example:
            //
            // BusinessName = "The Food Corner"
            //
            // Search:
            // tfc
            //
            // Generated abbreviation:
            // T + F + C = TFC
            //
            // Therefore:
            // "tfc" == "The Food Corner"
            // =================================================

            var abbreviationKeyword = new string(
                searchKeyword
                    .Where(char.IsLetterOrDigit)
                    .ToArray()
            );

            if (!string.IsNullOrWhiteSpace(abbreviationKeyword))
            {
                // =================================================
                // ALL PLACES
                // =================================================

                var allPlaces = await _context.Places
                    .Include(x => x.Category)
                    .ToListAsync();

                foreach (var place in allPlaces)
                {
                    var abbreviation =
                        GenerateAbbreviation(place.Name);

                    if (
                        abbreviation.Equals(
                            abbreviationKeyword,
                            StringComparison.OrdinalIgnoreCase
                        )
                    )
                    {
                        if (!places.Any(x =>
                            x.PlaceId == place.PlaceId))
                        {
                            places.Add(place);
                        }
                    }
                }

                // =================================================
                // ALL APPROVED + ACTIVE BUSINESSES
                // =================================================

                var allBusinesses =
                    await _context.Businesses
                        .Include(x => x.Category)
                        .Include(x => x.Photos)
                        .Where(x =>
                            x.IsActive &&
                            x.IsApproved)
                        .ToListAsync();

                foreach (var business in allBusinesses)
                {
                    var abbreviation =
                        GenerateAbbreviation(
                            business.BusinessName);

                    if (
                        abbreviation.Equals(
                            abbreviationKeyword,
                            StringComparison.OrdinalIgnoreCase
                        )
                    )
                    {
                        if (!businesses.Any(x =>
                            x.BusinessId ==
                            business.BusinessId))
                        {
                            businesses.Add(business);
                        }
                    }
                }
            }

            // =================================================
            // SORT AGAIN AFTER ABBREVIATION MATCHES
            // =================================================

            places = places
                .OrderByDescending(x => x.Rating)
                .ToList();

            businesses = businesses
                .OrderByDescending(x => x.Rating)
                .ThenByDescending(x => x.CreatedAt)
                .ToList();

            // =================================================
            // RETURN COMBINED RESULT
            // =================================================

            return Ok(new
            {
                Places = places,
                Businesses = businesses
            });
        }

        // =====================================================
        // GENERATE ABBREVIATION
        //
        // Example:
        //
        // "The Food Corner"
        // -> "TFC"
        //
        // "Cafe Coffee Day"
        // -> "CCD"
        //
        // "Hotel Blue Moon"
        // -> "HBM"
        // =====================================================

        private static string GenerateAbbreviation(
            string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return string.Empty;
            }

            var words = name
                .Trim()
                .Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries
                );

            var abbreviation = string.Concat(
                words
                    .Where(word =>
                        !string.IsNullOrWhiteSpace(word))
                    .Select(word =>
                        char.ToLowerInvariant(word[0]))
            );

            return abbreviation;
        }

        // =====================================================
        // SEARCH BY CITY
        // GET: api/search/city/pune
        //
        // Searches:
        // 1. Existing Places
        // 2. Owner-created Businesses
        // =====================================================

        [HttpGet("city/{city}")]
        public async Task<IActionResult> SearchCity(string city)
        {
            if (string.IsNullOrWhiteSpace(city))
            {
                return Ok(new
                {
                    Places = new List<object>(),
                    Businesses = new List<object>()
                });
            }

            city = city.Trim();

            var searchCity = city.ToLower();

            // =================================================
            // PLACES
            // =================================================

            var places = await _context.Places
                .Include(x => x.Category)
                .Where(x =>
                    x.City.ToLower()
                        .Contains(searchCity))
                .OrderByDescending(x => x.Rating)
                .ToListAsync();

            // =================================================
            // BUSINESSES
            // =================================================

            var businesses = await _context.Businesses
                .Include(x => x.Category)
                .Include(x => x.Photos)
                .Where(x =>
                    x.IsActive &&
                    x.IsApproved &&
                    x.City.ToLower()
                        .Contains(searchCity))
                .OrderByDescending(x => x.Rating)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync();

            // =================================================
            // RETURN
            // =================================================

            return Ok(new
            {
                Places = places,
                Businesses = businesses
            });
        }

        // =====================================================
        // SEARCH BY CATEGORY
        // GET: api/search/category/Cafe
        //
        // Searches:
        // 1. Existing Places
        // 2. Owner-created Businesses
        // =====================================================

        [HttpGet("category/{category}")]
        public async Task<IActionResult> SearchCategory(
            string category)
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                return Ok(new
                {
                    Places = new List<object>(),
                    Businesses = new List<object>()
                });
            }

            category = category.Trim();

            var searchCategory = category.ToLower();

            // =================================================
            // PLACES
            // =================================================

            var places = await _context.Places
                .Include(x => x.Category)
                .Where(x =>
                    x.Category != null &&
                    x.Category.CategoryName
                        .ToLower()
                        .Contains(searchCategory))
                .OrderByDescending(x => x.Rating)
                .ToListAsync();

            // =================================================
            // BUSINESSES
            // =================================================

            var businesses = await _context.Businesses
                .Include(x => x.Category)
                .Include(x => x.Photos)
                .Where(x =>
                    x.IsActive &&
                    x.IsApproved &&
                    x.Category != null &&
                    x.Category.CategoryName
                        .ToLower()
                        .Contains(searchCategory))
                .OrderByDescending(x => x.Rating)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync();

            // =================================================
            // RETURN
            // =================================================

            return Ok(new
            {
                Places = places,
                Businesses = businesses
            });
        }

        // =====================================================
        // SEARCH SUGGESTIONS
        // GET: api/search/suggestions/pi
        //
        // Suggestions from:
        // 1. Places
        // 2. Approved Businesses
        // =====================================================

        [HttpGet("suggestions/{keyword}")]
        public async Task<IActionResult> Suggestions(
            string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return Ok(new List<string>());
            }

            keyword = keyword.Trim();

            var searchKeyword = keyword.ToLower();

            // =================================================
            // PLACE SUGGESTIONS
            // =================================================

            var placeSuggestions = await _context.Places
                .Where(x =>
                    x.Name.ToLower()
                        .Contains(searchKeyword))
                .Select(x => x.Name)
                .Distinct()
                .Take(10)
                .ToListAsync();

            // =================================================
            // BUSINESS SUGGESTIONS
            // =================================================

            var businessSuggestions =
                await _context.Businesses
                    .Where(x =>
                        x.IsActive &&
                        x.IsApproved &&
                        x.BusinessName
                            .ToLower()
                            .Contains(searchKeyword))
                    .Select(x => x.BusinessName)
                    .Distinct()
                    .Take(10)
                    .ToListAsync();

            // =================================================
            // ABBREVIATION SUGGESTIONS
            // =================================================

            var abbreviationKeyword =
                new string(
                    searchKeyword
                        .Where(char.IsLetterOrDigit)
                        .ToArray()
                );

            if (!string.IsNullOrWhiteSpace(
                abbreviationKeyword))
            {
                var allPlaceNames =
                    await _context.Places
                        .Select(x => x.Name)
                        .ToListAsync();

                var abbreviationPlaceSuggestions =
                    allPlaceNames
                        .Where(name =>
                            GenerateAbbreviation(name)
                                .Equals(
                                    abbreviationKeyword,
                                    StringComparison
                                        .OrdinalIgnoreCase))
                        .ToList();

                placeSuggestions =
                    placeSuggestions
                        .Concat(
                            abbreviationPlaceSuggestions)
                        .Distinct(
                            StringComparer
                                .OrdinalIgnoreCase)
                        .Take(10)
                        .ToList();

                var allBusinessNames =
                    await _context.Businesses
                        .Where(x =>
                            x.IsActive &&
                            x.IsApproved)
                        .Select(x => x.BusinessName)
                        .ToListAsync();

                var abbreviationBusinessSuggestions =
                    allBusinessNames
                        .Where(name =>
                            GenerateAbbreviation(name)
                                .Equals(
                                    abbreviationKeyword,
                                    StringComparison
                                        .OrdinalIgnoreCase))
                        .ToList();

                businessSuggestions =
                    businessSuggestions
                        .Concat(
                            abbreviationBusinessSuggestions)
                        .Distinct(
                            StringComparer
                                .OrdinalIgnoreCase)
                        .Take(10)
                        .ToList();
            }

            // =================================================
            // COMBINE
            // =================================================

            var suggestions = placeSuggestions
                .Concat(businessSuggestions)
                .Distinct(
                    StringComparer
                        .OrdinalIgnoreCase)
                .Take(10)
                .ToList();

            return Ok(suggestions);
        }
    }
}