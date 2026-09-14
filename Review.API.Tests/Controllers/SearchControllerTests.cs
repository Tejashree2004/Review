using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.Models;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class SearchControllerTests
{
    private static SearchController CreateController(AppDbContext context)
    {
        return new SearchController(context);
    }

    private static Category CreateCategory(
        int id,
        string name)
    {
        return new Category
        {
            CategoryId = id,
            CategoryName = name
        };
    }

    private static Place CreatePlace(
        int id,
        string name,
        string city,
        string address,
        int categoryId,
        double rating)
    {
        return new Place
        {
            PlaceId = id,
            Name = name,
            City = city,
            Address = address,
            CategoryId = categoryId,
            Rating = rating,
            ReviewCount = 10,
            OpenStatus = true
        };
    }

    private static Business CreateBusiness(
        int id,
        string name,
        string city,
        string address,
        int categoryId,
        bool active = true,
        bool approved = true,
        DateTime? createdAt = null)
    {
        return new Business
        {
            BusinessId = id,
            OwnerId = 1,
            BusinessName = name,
            City = city,
            Address = address,
            CategoryId = categoryId,
            IsActive = active,
            IsApproved = approved,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };
    }

    [Fact]
    public async Task SearchPlace_EmptyKeyword_ReturnsEmptyResults()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.Add(
            CreatePlace(
                1,
                "Pizza Hub",
                "Pune",
                "FC Road",
                1,
                4.5));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.SearchPlace(" ");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task SearchPlace_ByName_ReturnsMatchingPlace()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.AddRange(
            CreatePlace(
                1,
                "Pizza Hub",
                "Pune",
                "FC Road",
                1,
                4.5),
            CreatePlace(
                2,
                "Coffee House",
                "Pune",
                "MG Road",
                1,
                4.0));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.SearchPlace("pizza");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var placesProperty =
            value.GetType().GetProperty("Places");

        Assert.NotNull(placesProperty);

        var places =
            placesProperty!.GetValue(value) as IEnumerable<Place>;

        Assert.NotNull(places);
        Assert.Single(places!);

        Assert.Equal(
            "Pizza Hub",
            places!.First().Name);
    }

    [Fact]
    public async Task SearchPlace_ByCity_ReturnsMatchingPlace()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.AddRange(
            CreatePlace(
                1,
                "Pizza Hub",
                "Pune",
                "FC Road",
                1,
                4.5),
            CreatePlace(
                2,
                "Mumbai Cafe",
                "Mumbai",
                "Andheri",
                1,
                4.8));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.SearchPlace("pune");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var placesProperty =
            value.GetType().GetProperty("Places");

        var places =
            placesProperty!.GetValue(value) as IEnumerable<Place>;

        Assert.Single(places!);
        Assert.Equal("Pune", places!.First().City);
    }

    [Fact]
    public async Task SearchPlace_ByCategory_ReturnsMatchingPlace()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.AddRange(
            CreateCategory(1, "Restaurant"),
            CreateCategory(2, "Gym"));

        context.Places.AddRange(
            CreatePlace(
                1,
                "Food Corner",
                "Pune",
                "FC Road",
                1,
                4.5),
            CreatePlace(
                2,
                "Fitness Club",
                "Pune",
                "Baner",
                2,
                4.7));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.SearchPlace("restaurant");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var placesProperty =
            value.GetType().GetProperty("Places");

        var places =
            placesProperty!.GetValue(value) as IEnumerable<Place>;

        Assert.Single(places!);
        Assert.Equal("Food Corner", places!.First().Name);
    }

    [Fact]
    public async Task SearchPlace_ExcludesInactiveAndUnapprovedBusinesses()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Businesses.AddRange(
            CreateBusiness(
                1,
                "Active Approved Restaurant",
                "Pune",
                "FC Road",
                1,
                active: true,
                approved: true),
            CreateBusiness(
                2,
                "Inactive Restaurant",
                "Pune",
                "Baner",
                1,
                active: false,
                approved: true),
            CreateBusiness(
                3,
                "Unapproved Restaurant",
                "Pune",
                "Kothrud",
                1,
                active: true,
                approved: false));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchPlace("restaurant");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.NotNull(businesses);
        Assert.Single(businesses!);
    }

    [Fact]
    public async Task SearchPlace_Abbreviation_ReturnsMatchingBusiness()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Businesses.Add(
            CreateBusiness(
                1,
                "The Food Corner",
                "Pune",
                "FC Road",
                1));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchPlace("tfc");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.NotNull(businesses);
        Assert.Single(businesses!);
    }

    [Fact]
    public async Task SearchPlace_CalculatesActualBusinessRatingFromReviews()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Businesses.Add(
            CreateBusiness(
                1,
                "The Food Corner",
                "Pune",
                "FC Road",
                1));

        context.Reviews.AddRange(
            new ReviewItem
            {
                UserId = 1,
                BusinessId = 1,
                Rating = 5,
                Comment = "Excellent"
            },
            new ReviewItem
            {
                UserId = 2,
                BusinessId = 1,
                Rating = 3,
                Comment = "Good"
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchPlace("food");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.NotNull(businesses);

        var business = businesses!.Single();

        var ratingProperty =
            business.GetType().GetProperty("AverageRating");

        var countProperty =
            business.GetType().GetProperty("ReviewCount");

        Assert.NotNull(ratingProperty);
        Assert.NotNull(countProperty);

        Assert.Equal(
            4.0,
            (double)ratingProperty!.GetValue(business)!);

        Assert.Equal(
            2,
            (int)countProperty!.GetValue(business)!);
    }

    [Fact]
    public async Task SearchCity_EmptyCity_ReturnsEmptyResults()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var result =
            await controller.SearchCity(" ");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task SearchCity_ReturnsPlacesAndApprovedBusinesses()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.Add(
            CreatePlace(
                1,
                "Pune Food Hub",
                "Pune",
                "FC Road",
                1,
                4.5));

        context.Businesses.AddRange(
            CreateBusiness(
                1,
                "Pune Restaurant",
                "Pune",
                "Baner",
                1,
                active: true,
                approved: true),
            CreateBusiness(
                2,
                "Inactive Pune Restaurant",
                "Pune",
                "Kothrud",
                1,
                active: false,
                approved: true));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchCity("pune");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var placesProperty =
            value.GetType().GetProperty("Places");

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var places =
            placesProperty!.GetValue(value) as IEnumerable<Place>;

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.Single(places!);
        Assert.Single(businesses!);
    }

    [Fact]
    public async Task SearchCity_SortsBusinessesUsingActualRating()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Businesses.AddRange(
            CreateBusiness(
                1,
                "Low Rated Restaurant",
                "Pune",
                "FC Road",
                1,
                createdAt: DateTime.UtcNow.AddDays(-1)),
            CreateBusiness(
                2,
                "High Rated Restaurant",
                "Pune",
                "Baner",
                1,
                createdAt: DateTime.UtcNow));

        context.Reviews.AddRange(
            new ReviewItem
            {
                UserId = 1,
                BusinessId = 1,
                Rating = 2,
                Comment = "Average"
            },
            new ReviewItem
            {
                UserId = 2,
                BusinessId = 2,
                Rating = 5,
                Comment = "Excellent"
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchCity("pune");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.NotNull(businesses);

        var ordered = businesses!.ToList();

        Assert.Equal(2, ordered.Count);

        var firstName =
            ordered[0]
                .GetType()
                .GetProperty("BusinessName")!
                .GetValue(ordered[0]);

        Assert.Equal(
            "High Rated Restaurant",
            firstName);
    }

    [Fact]
    public async Task SearchCategory_EmptyCategory_ReturnsEmptyResults()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var result =
            await controller.SearchCategory(" ");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task SearchCategory_ReturnsMatchingPlacesAndBusinesses()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.AddRange(
            CreateCategory(1, "Cafe"),
            CreateCategory(2, "Gym"));

        context.Places.AddRange(
            CreatePlace(
                1,
                "Coffee Point",
                "Pune",
                "FC Road",
                1,
                4.5),
            CreatePlace(
                2,
                "Fitness Zone",
                "Pune",
                "Baner",
                2,
                4.7));

        context.Businesses.AddRange(
            CreateBusiness(
                1,
                "Cafe Corner",
                "Pune",
                "Kothrud",
                1),
            CreateBusiness(
                2,
                "Gym World",
                "Pune",
                "Baner",
                2));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchCategory("cafe");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var placesProperty =
            value.GetType().GetProperty("Places");

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var places =
            placesProperty!.GetValue(value) as IEnumerable<Place>;

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.Single(places!);
        Assert.Single(businesses!);

        Assert.Equal(
            "Coffee Point",
            places!.First().Name);
    }

    [Fact]
    public async Task Suggestions_EmptyKeyword_ReturnsEmptyList()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var result =
            await controller.Suggestions(" ");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);

        var suggestions =
            Assert.IsAssignableFrom<IEnumerable<string>>(
                ok.Value);

        Assert.Empty(suggestions);
    }

    [Fact]
    public async Task Suggestions_ReturnsPlaceAndBusinessNames()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.Add(
            CreatePlace(
                1,
                "Pizza Hub",
                "Pune",
                "FC Road",
                1,
                4.5));

        context.Businesses.Add(
            CreateBusiness(
                1,
                "Pizza Corner",
                "Pune",
                "Baner",
                1));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.Suggestions("pizza");

        var ok = Assert.IsType<OkObjectResult>(result);

        var suggestions =
            Assert.IsAssignableFrom<IEnumerable<string>>(
                ok.Value);

        var list = suggestions.ToList();

        Assert.Contains(
            "Pizza Hub",
            list);

        Assert.Contains(
            "Pizza Corner",
            list);
    }

    [Fact]
    public async Task Suggestions_Abbreviation_ReturnsMatchingNames()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Places.Add(
            CreatePlace(
                1,
                "The Food Corner",
                "Pune",
                "FC Road",
                1,
                4.5));

        context.Businesses.Add(
            CreateBusiness(
                1,
                "Cafe Coffee Day",
                "Pune",
                "Baner",
                1));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.Suggestions("tfc");

        var ok = Assert.IsType<OkObjectResult>(result);

        var suggestions =
            Assert.IsAssignableFrom<IEnumerable<string>>(
                ok.Value);

        var list = suggestions.ToList();

        Assert.Contains(
            "The Food Corner",
            list);
    }

    [Fact]
    public async Task SearchPlace_DoesNotReturnUnapprovedBusinessThroughAbbreviation()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            CreateCategory(1, "Restaurant"));

        context.Businesses.Add(
            CreateBusiness(
                1,
                "The Food Corner",
                "Pune",
                "FC Road",
                1,
                active: true,
                approved: false));

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.SearchPlace("tfc");

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(ok.Value);
        var value = ok.Value;

        var businessesProperty =
            value.GetType().GetProperty("Businesses");

        var businesses =
            businessesProperty!.GetValue(value)
                as IEnumerable<object>;

        Assert.NotNull(businesses);
        Assert.Empty(businesses!);
    }
}


