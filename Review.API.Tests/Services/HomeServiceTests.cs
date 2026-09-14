using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;
using Review.API.Tests.Helpers;
using Review.API.Services;

namespace Review.API.Tests.Services;

public class HomeServiceTests
{
    [Fact]
    public async Task GetCategoriesAsync_ShouldReturnCategoriesAlphabetically()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.AddRange(
            new Category { CategoryId = 1, CategoryName = "Restaurants" },
            new Category { CategoryId = 2, CategoryName = "Cafes" },
            new Category { CategoryId = 3, CategoryName = "Hotels" }
        );

        await context.SaveChangesAsync();

        var service = new HomeService(context);

        var result = await service.GetCategoriesAsync();

        Assert.Equal(3, result.Count);
        Assert.Equal("Cafes", result[0].CategoryName);
        Assert.Equal("Hotels", result[1].CategoryName);
        Assert.Equal("Restaurants", result[2].CategoryName);
    }

    [Fact]
    public async Task GetPlaceAsync_ShouldReturnPlaceWithCategory()
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

        var result = await service.GetPlaceAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Test Restaurant", result.Name);
        Assert.Equal("Pune", result.City);
        Assert.NotNull(result.Category);
        Assert.Equal("Restaurant", result.Category!.CategoryName);
    }

    [Fact]
    public async Task GetPlaceAsync_ShouldReturnNull_WhenPlaceDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new HomeService(context);

        var result = await service.GetPlaceAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetTopRatedPlacesAsync_ShouldReturnPlacesAndApprovedBusinesses()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Food"
            });

        context.Places.AddRange(
            new Place
            {
                PlaceId = 1,
                Name = "High Rated Place",
                CategoryId = 1,
                Rating = 5.0,
                ReviewCount = 10
            },
            new Place
            {
                PlaceId = 2,
                Name = "Low Rated Place",
                CategoryId = 1,
                Rating = 3.0,
                ReviewCount = 5
            });

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Approved Business",
                IsActive = true,
                IsApproved = true,
                IsOpen = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 11,
                CategoryId = 1,
                BusinessName = "Inactive Business",
                IsActive = false,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 3,
                OwnerId = 12,
                CategoryId = 1,
                BusinessName = "Unapproved Business",
                IsActive = true,
                IsApproved = false
            });

        await context.SaveChangesAsync();

        var service = new HomeService(context);

        var result = await service.GetTopRatedPlacesAsync();

        Assert.Equal(3, result.Count);

        var names = result
            .Select(x => x.GetType().GetProperty("Name")!.GetValue(x)!.ToString())
            .ToList();

        Assert.Contains("High Rated Place", names);
        Assert.Contains("Low Rated Place", names);
        Assert.Contains("Approved Business", names);
        Assert.DoesNotContain("Inactive Business", names);
        Assert.DoesNotContain("Unapproved Business", names);
    }

    [Fact]
    public async Task GetTopRatedPlacesAsync_ShouldCalculateBusinessRatingAndUsePrimaryPhoto()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Cafe"
            });

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Test Cafe",
                IsActive = true,
                IsApproved = true,
                IsOpen = true
            });

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                BusinessId = 1,
                Rating = 5,
                Comment = "Excellent"
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 2,
                BusinessId = 1,
                Rating = 3,
                Comment = "Good"
            });

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/old.jpg",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 1,
                PhotoUrl = "/primary.jpg",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            });

        await context.SaveChangesAsync();

        var service = new HomeService(context);

        var result = await service.GetTopRatedPlacesAsync();

        var business = Assert.Single(result);

        var type = business.GetType();

        Assert.Equal("Test Cafe", type.GetProperty("Name")!.GetValue(business));
        Assert.Equal("Business", type.GetProperty("Type")!.GetValue(business));
        Assert.Equal(4.0, type.GetProperty("Rating")!.GetValue(business));
        Assert.Equal(2, type.GetProperty("ReviewCount")!.GetValue(business));
        Assert.Equal("/primary.jpg", type.GetProperty("ImageUrl")!.GetValue(business));
    }
}
