using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.Models;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class FavoriteControllerTests
{
    private static FavoriteController CreateController(AppDbContext context)
    {
        return new FavoriteController(context);
    }

    private static Place CreatePlace(int id)
    {
        return new Place
        {
            PlaceId = id,
            Name = "Test Place",
            Address = "Test Address",
            City = "Pune",
            Rating = 4.5,
            ReviewCount = 10,
            OpenStatus = true
        };
    }

    private static Business CreateBusiness(
        int id,
        int ownerId = 10)
    {
        return new Business
        {
            BusinessId = id,
            OwnerId = ownerId,
            CategoryId = 7,
            BusinessName = "Test Business",
            Description = "Test Description",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Test Address",
            City = "Pune",
            Pincode = "411001",
            Website = "https://example.com",
            OpeningTime = "09:00",
            ClosingTime = "21:00",
            IsOpen = true,
            IsApproved = true,
            IsActive = true,
            Rating = 4.5,
            ReviewCount = 5,
            CreatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task AddFavorite_ShouldReturnBadRequest_WhenUserIdIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 0,
            PlaceId = 1
        };

        var result = await controller.AddFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddFavorite_ShouldReturnBadRequest_WhenPlaceIdIsMissing()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1
        };

        var result = await controller.AddFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddFavorite_ShouldReturnNotFound_WhenPlaceDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            PlaceId = 999
        };

        var result = await controller.AddFavorite(favorite);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task AddFavorite_ShouldReturnBadRequest_WhenFavoriteAlreadyExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Places.Add(CreatePlace(1));

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                PlaceId = 1,
                BusinessId = null
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            PlaceId = 1
        };

        var result = await controller.AddFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddFavorite_ShouldReturnOk_WhenPlaceFavoriteIsAdded()
    {
        using var context = TestDbContextFactory.Create();

        context.Places.Add(CreatePlace(1));
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            PlaceId = 1
        };

        var result = await controller.AddFavorite(favorite);

        Assert.IsType<OkObjectResult>(result);

        var savedFavorite =
            context.Favorites.Single();

        Assert.Equal(1, savedFavorite.UserId);
        Assert.Equal(1, savedFavorite.PlaceId);
        Assert.Null(savedFavorite.BusinessId);
    }

    [Fact]
    public async Task AddBusinessFavorite_ShouldReturnBadRequest_WhenUserIdIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 0,
            BusinessId = 1
        };

        var result =
            await controller.AddBusinessFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddBusinessFavorite_ShouldReturnBadRequest_WhenBusinessIdIsMissing()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1
        };

        var result =
            await controller.AddBusinessFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddBusinessFavorite_ShouldReturnNotFound_WhenBusinessDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            BusinessId = 999
        };

        var result =
            await controller.AddBusinessFavorite(favorite);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task AddBusinessFavorite_ShouldReturnBadRequest_WhenFavoriteAlreadyExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1));

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                PlaceId = null,
                BusinessId = 1
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            BusinessId = 1
        };

        var result =
            await controller.AddBusinessFavorite(favorite);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddBusinessFavorite_ShouldReturnOk_WhenBusinessFavoriteIsAdded()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1));
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var favorite = new Favorite
        {
            UserId = 1,
            BusinessId = 1
        };

        var result =
            await controller.AddBusinessFavorite(favorite);

        Assert.IsType<OkObjectResult>(result);

        var savedFavorite =
            context.Favorites.Single();

        Assert.Equal(1, savedFavorite.UserId);
        Assert.Null(savedFavorite.PlaceId);
        Assert.Equal(1, savedFavorite.BusinessId);
    }

    [Fact]
    public async Task GetFavorites_ShouldReturnFavoritesForUser()
    {
        using var context = TestDbContextFactory.Create();

        context.Places.Add(CreatePlace(1));
        context.Businesses.Add(CreateBusiness(2));

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                PlaceId = 1
            });

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 2,
                UserId = 1,
                BusinessId = 2
            });

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 3,
                UserId = 2,
                PlaceId = 1
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.GetFavorites(1);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);

        var favorites =
            Assert.IsAssignableFrom<IEnumerable<Favorite>>(
                okResult.Value);

        Assert.Equal(2, favorites.Count());
    }

    [Fact]
    public async Task GetFavorites_ShouldCalculateBusinessRatingFromReviews()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1));

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                BusinessId = 1
            });

        context.Reviews.Add(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                BusinessId = 1,
                Rating = 5,
                Comment = "Excellent"
            });

        context.Reviews.Add(
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 2,
                BusinessId = 1,
                Rating = 3,
                Comment = "Good"
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.GetFavorites(1);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        var favorites =
            Assert.IsAssignableFrom<IEnumerable<Favorite>>(
                okResult.Value);

        var favorite =
            Assert.Single(favorites);

        Assert.NotNull(favorite.Business);
        Assert.Equal(4, favorite.Business!.Rating);
        Assert.Equal(2, favorite.Business.ReviewCount);
    }

    [Fact]
    public async Task RemoveFavorite_ShouldReturnNotFound_WhenFavoriteDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var result =
            await controller.RemoveFavorite(1, 999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task RemoveFavorite_ShouldReturnOk_WhenFavoriteExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                PlaceId = 1,
                BusinessId = null
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.RemoveFavorite(1, 1);

        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(context.Favorites);
    }

    [Fact]
    public async Task RemoveBusinessFavorite_ShouldReturnNotFound_WhenFavoriteDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var controller = CreateController(context);

        var result =
            await controller.RemoveBusinessFavorite(1, 999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task RemoveBusinessFavorite_ShouldReturnOk_WhenFavoriteExists()
    {
        using var context = TestDbContextFactory.Create();

        context.Favorites.Add(
            new Favorite
            {
                FavoriteId = 1,
                UserId = 1,
                PlaceId = null,
                BusinessId = 2
            });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result =
            await controller.RemoveBusinessFavorite(1, 2);

        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(context.Favorites);
    }
}
