using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.Models;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class ProfileControllerTests
{
    [Fact]
    public async Task GetProfile_ShouldReturnOk_WhenUserExists()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Tejashree Shejwal",
            Email = "tejashree@example.com",
            MobileNumber = "9876543210"
        });

        await context.SaveChangesAsync();

        var controller = new ProfileController(context);

        var result = await controller.GetProfile(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(ok.Value);

        Assert.Equal(1, user.Id);
        Assert.Equal("Tejashree Shejwal", user.FullName);
        Assert.Equal("tejashree@example.com", user.Email);
    }

    [Fact]
    public async Task GetProfile_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new ProfileController(context);

        var result = await controller.GetProfile(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal("User not found.", notFound.Value);
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturnBadRequest_WhenModelIsNull()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new ProfileController(context);

        var result = await controller.UpdateProfile(1, null!);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        var payload = badRequest.Value!;

        var success = payload.GetType()
            .GetProperty("success")!
            .GetValue(payload);

        var message = payload.GetType()
            .GetProperty("message")!
            .GetValue(payload);

        Assert.Equal(false, success);
        Assert.Equal("Profile data is required.", message);
    }

    [Fact]
    public async Task UpdateProfile_ShouldReturnNotFound_WhenUserDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new ProfileController(context);

        var model = new UpdateProfileRequest
        {
            FullName = "Updated User",
            Email = "updated@example.com",
            MobileNumber = "9999999999"
        };

        var result = await controller.UpdateProfile(999, model);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var payload = notFound.Value!;

        var message = payload.GetType()
            .GetProperty("message")!
            .GetValue(payload);

        Assert.Equal("User not found.", message);
    }

    [Fact]
    public async Task UpdateProfile_ShouldUpdateEditableFields_AndTrimValues()
    {
        await using var context = TestDbContextFactory.Create();

        var user = new User
        {
            Id = 1,
            FullName = "Old Name",
            Email = "old@example.com",
            MobileNumber = "1111111111"
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var oldUpdatedAt = user.UpdatedAt;

        var controller = new ProfileController(context);

        var model = new UpdateProfileRequest
        {
            FullName = "  New Name  ",
            Email = "  new@example.com  ",
            MobileNumber = "  9999999999  "
        };

        var result = await controller.UpdateProfile(1, model);

        var ok = Assert.IsType<OkObjectResult>(result);

        var payload = ok.Value!;

        var success = payload.GetType()
            .GetProperty("success")!
            .GetValue(payload);

        var message = payload.GetType()
            .GetProperty("message")!
            .GetValue(payload);

        Assert.Equal(true, success);
        Assert.Equal("Profile updated successfully.", message);

        var data = payload.GetType()
            .GetProperty("data")!
            .GetValue(payload)!;

        Assert.Equal(1, data.GetType().GetProperty("Id")!.GetValue(data));
        Assert.Equal(
            "New Name",
            data.GetType().GetProperty("FullName")!.GetValue(data));
        Assert.Equal(
            "new@example.com",
            data.GetType().GetProperty("Email")!.GetValue(data));
        Assert.Equal(
            "9999999999",
            data.GetType().GetProperty("MobileNumber")!.GetValue(data));

        Assert.NotEqual(oldUpdatedAt, user.UpdatedAt);
    }

    [Fact]
    public async Task UpdateProfile_ShouldUpdateOnlyNonEmptyFields()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Original Name",
            Email = "original@example.com",
            MobileNumber = "1111111111"
        });

        await context.SaveChangesAsync();

        var controller = new ProfileController(context);

        var model = new UpdateProfileRequest
        {
            FullName = "  Updated Name  ",
            Email = "   ",
            MobileNumber = null
        };

        var result = await controller.UpdateProfile(1, model);

        Assert.IsType<OkObjectResult>(result);

        var updatedUser = await context.Users.FindAsync(1);

        Assert.NotNull(updatedUser);
        Assert.Equal("Updated Name", updatedUser.FullName);
        Assert.Equal("original@example.com", updatedUser.Email);
        Assert.Equal("1111111111", updatedUser.MobileNumber);
    }

    [Fact]
    public async Task MyReviews_ShouldReturnReviews_InDescendingCreatedOrder()
    {
        await using var context = TestDbContextFactory.Create();

        var place = new Place
        {
            PlaceId = 1,
            Name = "Test Place"
        };

        var older = new ReviewItem
        {
            ReviewId = 1,
            UserId = 10,
            PlaceId = 1,
            Place = place,
            Rating = 3,
            Comment = "Older review",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var newer = new ReviewItem
        {
            ReviewId = 2,
            UserId = 10,
            PlaceId = 1,
            Place = place,
            Rating = 5,
            Comment = "Newer review",
            CreatedAt = DateTime.UtcNow
        };

        context.Places.Add(place);
        context.Reviews.AddRange(older, newer);

        await context.SaveChangesAsync();

        var controller = new ProfileController(context);

        var result = await controller.MyReviews(10);

        var ok = Assert.IsType<OkObjectResult>(result);

        var reviews = Assert.IsAssignableFrom<IEnumerable<ReviewItem>>(ok.Value);

        var list = reviews.ToList();

        Assert.Equal(2, list.Count);
        Assert.Equal(2, list[0].ReviewId);
        Assert.Equal("Newer review", list[0].Comment);
        Assert.Equal(1, list[1].ReviewId);
        Assert.Equal("Older review", list[1].Comment);
    }

    [Fact]
    public async Task MyReviews_ShouldReturnEmptyList_WhenUserHasNoReviews()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new ProfileController(context);

        var result = await controller.MyReviews(999);

        var ok = Assert.IsType<OkObjectResult>(result);

        var reviews = Assert.IsAssignableFrom<IEnumerable<ReviewItem>>(ok.Value);

        Assert.Empty(reviews);
    }
}
