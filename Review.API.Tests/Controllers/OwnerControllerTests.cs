using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class OwnerControllerTests
{
    private static OwnerController CreateController(
        OwnerService service,
        string? userId = "10")
    {
        var controller = new OwnerController(service);

        var claims = new List<Claim>();

        if (userId != null)
        {
            claims.Add(
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId));
        }

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

    private static Business CreateBusiness(
        int id = 1,
        int ownerId = 10)
    {
        return new Business
        {
            BusinessId = id,
            OwnerId = ownerId,
            CategoryId = 1,
            BusinessName = $"Business {id}",
            Description = "Test Description",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Main Road",
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
    public async Task GetMyBusinesses_ShouldReturnOk_WhenTokenIsValid()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            });

        context.Businesses.AddRange(
            CreateBusiness(1, 10),
            CreateBusiness(2, 10),
            CreateBusiness(3, 20));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.GetMyBusinesses();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(
            true,
            type.GetProperty("Success")!.GetValue(okResult.Value));

        Assert.Equal(
            "Owner businesses fetched successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var data = type.GetProperty("Data")!.GetValue(okResult.Value);
        Assert.NotNull(data);

        var businesses = Assert.IsAssignableFrom<IEnumerable<Business>>(data);
        Assert.Equal(2, businesses.Count());
    }

    [Fact]
    public async Task GetMyBusinesses_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, "invalid");

        var result = await controller.GetMyBusinesses();

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        var type = unauthorized.Value!.GetType();

        Assert.Equal(
            false,
            type.GetProperty("Success")!.GetValue(unauthorized.Value));

        Assert.Equal(
            "Invalid user token.",
            type.GetProperty("Message")!.GetValue(unauthorized.Value));
    }

    [Fact]
    public async Task GetMyBusiness_ShouldReturnOk_WhenBusinessBelongsToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            });

        context.Businesses.Add(CreateBusiness(1, 10));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.GetMyBusiness(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(
            true,
            type.GetProperty("Success")!.GetValue(okResult.Value));

        Assert.Equal(
            "Business fetched successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var data = type.GetProperty("Data")!.GetValue(okResult.Value);
        Assert.NotNull(data);

        var business = Assert.IsType<Business>(data);
        Assert.Equal(1, business.BusinessId);
        Assert.Equal(10, business.OwnerId);
    }

    [Fact]
    public async Task GetMyBusiness_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, null);

        var result = await controller.GetMyBusiness(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task GetMyBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            });

        context.Businesses.Add(CreateBusiness(1, 10));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "99");

        var result = await controller.GetMyBusiness(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var type = notFound.Value!.GetType();

        Assert.Equal(
            false,
            type.GetProperty("Success")!.GetValue(notFound.Value));

        Assert.Equal(
            "Business not found.",
            type.GetProperty("Message")!.GetValue(notFound.Value));
    }
}
