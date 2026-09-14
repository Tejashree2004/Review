using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class HomeControllerTests
{
    [Fact]
    public async Task GetCategories_ShouldReturnOkWithCategories()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.AddRange(
            new Category { CategoryId = 1, CategoryName = "Restaurants" },
            new Category { CategoryId = 2, CategoryName = "Cafes" }
        );

        await context.SaveChangesAsync();

        var service = new HomeService(context);
        var controller = new HomeController(service);

        var result = await controller.GetCategories();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var categories = Assert.IsAssignableFrom<IReadOnlyList<Category>>(okResult.Value);

        Assert.Equal(2, categories.Count);
        Assert.Equal("Cafes", categories[0].CategoryName);
        Assert.Equal("Restaurants", categories[1].CategoryName);
    }

    [Fact]
    public async Task GetTopRatedPlaces_ShouldReturnOkWithData()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Food"
            });

        context.Places.Add(
            new Place
            {
                PlaceId = 1,
                Name = "Test Place",
                CategoryId = 1,
                Rating = 5,
                ReviewCount = 10
            });

        await context.SaveChangesAsync();

        var service = new HomeService(context);
        var controller = new HomeController(service);

        var result = await controller.GetTopRatedPlaces();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetPlace_ShouldReturnOk_WhenPlaceExists()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            });

        context.Places.Add(
            new Place
            {
                PlaceId = 1,
                Name = "Test Restaurant",
                CategoryId = 1,
                Address = "Main Road",
                City = "Pune",
                Rating = 4.5,
                ReviewCount = 20
            });

        await context.SaveChangesAsync();

        var service = new HomeService(context);
        var controller = new HomeController(service);

        var result = await controller.GetPlace(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var place = Assert.IsType<Place>(okResult.Value);

        Assert.Equal(1, place.PlaceId);
        Assert.Equal("Test Restaurant", place.Name);
        Assert.Equal("Pune", place.City);
    }

    [Fact]
    public async Task GetPlace_ShouldReturnNotFound_WhenPlaceDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new HomeService(context);
        var controller = new HomeController(service);

        var result = await controller.GetPlace(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetSummary_ShouldReturnOkWithExpectedData()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new HomeService(context);
        var controller = new HomeController(service);

        var result = controller.GetSummary();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var type = okResult.Value.GetType();

        Assert.Equal("Excellent", type.GetProperty("Food")!.GetValue(okResult.Value));
        Assert.Equal("Very Good", type.GetProperty("Service")!.GetValue(okResult.Value));
        Assert.Equal("Excellent", type.GetProperty("Cleanliness")!.GetValue(okResult.Value));
        Assert.Equal("Available", type.GetProperty("Parking")!.GetValue(okResult.Value));
    }
}
