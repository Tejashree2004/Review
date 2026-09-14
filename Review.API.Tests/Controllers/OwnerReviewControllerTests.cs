using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;
using System.Security.Claims;

namespace Review.API.Tests.Controllers;

public class OwnerReviewControllerTests
{
    private static OwnerReviewController CreateController(
        OwnerService service,
        int? userId = null)
    {
        var controller = new OwnerReviewController(service);

        var claims = new List<Claim>();

        if (userId.HasValue)
            claims.Add(new Claim(
                ClaimTypes.NameIdentifier,
                userId.Value.ToString()));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity(claims, "TestAuth"))
            }
        };

        return controller;
    }

    [Fact]
    public async Task GetReviews_ShouldReturnUnauthorized_WhenUserIdClaimIsMissing()
    {
        await using var context = TestDbContextFactory.Create();
        var service = new OwnerService(context);
        var controller = CreateController(service);

        var result = await controller.GetReviews(1);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);

        var message = unauthorized.Value!
            .GetType()
            .GetProperty("Message")!
            .GetValue(unauthorized.Value);

        Assert.Equal("Invalid user token.", message);
    }

    [Fact]
    public async Task GetReviews_ShouldReturnOk_WithOwnerReviews()
    {
        await using var context = TestDbContextFactory.Create();

        var category = new Category
        {
            CategoryId = 1,
        };

        var user = new User
        {
            Id = 10,
            FullName = "Test User",
            Email = "test@example.com"
        };

        var business = new Business
        {
            BusinessId = 1,
            BusinessName = "Test Business",
            OwnerId = 10,
            CategoryId = 1,
            IsActive = true,
            Category = category
        };

        var review = new ReviewItem
        {
            ReviewId = 1,
            BusinessId = 1,
            Business = business,
            UserId = 10,
            User = user,
            Rating = 5,
            Comment = "Excellent",
            CreatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);
        context.Users.Add(user);
        context.Businesses.Add(business);
        context.Reviews.Add(review);
        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, 10);

        var result = await controller.GetReviews(1);

        var ok = Assert.IsType<OkObjectResult>(result);

        var payload = ok.Value!;

        var success = payload.GetType()
            .GetProperty("Success")!
            .GetValue(payload);

        var message = payload.GetType()
            .GetProperty("Message")!
            .GetValue(payload);

        var data = payload.GetType()
            .GetProperty("Data")!
            .GetValue(payload) as List<ReviewItem>;

        Assert.Equal(true, success);
        Assert.Equal("Reviews fetched successfully.", message);
        Assert.NotNull(data);
        Assert.Single(data);
        Assert.Equal(1, data[0].ReviewId);
        Assert.Equal(5, data[0].Rating);
        Assert.Equal("Excellent", data[0].Comment);
    }

    [Fact]
    public async Task GetReviews_ShouldReturnEmptyList_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            BusinessName = "Test Business",
            OwnerId = 20,
            CategoryId = 1,
            IsActive = true
        });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, 10);

        var result = await controller.GetReviews(1);

        var ok = Assert.IsType<OkObjectResult>(result);

        var payload = ok.Value!;

        var data = payload.GetType()
            .GetProperty("Data")!
            .GetValue(payload) as List<ReviewItem>;

        Assert.NotNull(data);
        Assert.Empty(data);
    }

    [Fact]
    public async Task ReplyToReview_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();
        var service = new OwnerService(context);
        var controller = CreateController(service, 10);

        controller.ModelState.AddModelError(
            "Reply",
            "Reply is required.");

        var dto = new Review.API.DTOs.OwnerReplyDto
        {
            ReviewId = 1,
            Reply = ""
        };

        var result = await controller.ReplyToReview(1, dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ReplyToReview_ShouldReturnUnauthorized_WhenUserIdClaimIsMissing()
    {
        await using var context = TestDbContextFactory.Create();
        var service = new OwnerService(context);
        var controller = CreateController(service);

        var dto = new Review.API.DTOs.OwnerReplyDto
        {
            ReviewId = 1,
            Reply = "Thank you for your review."
        };

        var result = await controller.ReplyToReview(1, dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);

        var message = unauthorized.Value!
            .GetType()
            .GetProperty("Message")!
            .GetValue(unauthorized.Value);

        Assert.Equal("Invalid user token.", message);
    }

    [Fact]
    public async Task ReplyToReview_ShouldReturnNotFound_WhenReviewDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();
        var service = new OwnerService(context);
        var controller = CreateController(service, 10);

        var dto = new Review.API.DTOs.OwnerReplyDto
        {
            ReviewId = 999,
            Reply = "Thank you for your review."
        };

        var result = await controller.ReplyToReview(999, dto);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var message = notFound.Value!
            .GetType()
            .GetProperty("Message")!
            .GetValue(notFound.Value);

        Assert.Equal(
            "Review not found or you are not authorized.",
            message);
    }

    [Fact]
    public async Task ReplyToReview_ShouldReturnNotFound_WhenOwnerIsNotAuthorized()
    {
        await using var context = TestDbContextFactory.Create();

        var category = new Category
        {
            CategoryId = 1,
        };

        var place = new Place
        {
            PlaceId = 1,
            Name = "Test Business"
        };

        var review = new ReviewItem
        {
            ReviewId = 1,
            PlaceId = 1,
            Place = place,
            Rating = 5,
            Comment = "Great place",
            CreatedAt = DateTime.UtcNow
        };

        context.Categories.Add(category);

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            BusinessName = "Test Business",
            OwnerId = 20,
            CategoryId = 1,
            IsActive = true
        });

        context.Places.Add(place);
        context.Reviews.Add(review);
        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, 10);

        var dto = new Review.API.DTOs.OwnerReplyDto
        {
            ReviewId = 1,
            Reply = "Thank you for your review."
        };

        var result = await controller.ReplyToReview(1, dto);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var message = notFound.Value!
            .GetType()
            .GetProperty("Message")!
            .GetValue(notFound.Value);

        Assert.Equal(
            "Review not found or you are not authorized.",
            message);
    }
}
