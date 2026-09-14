using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class OwnerBusinessControllerTests
{
    private static OwnerBusinessController CreateController(
        OwnerService service,
        string? userId = "10")
    {
        var controller = new OwnerBusinessController(service);

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

    private static void AddCategory(
        Review.API.Data.AppDbContext context,
        int id = 1)
    {
        context.Categories.Add(
            new Category
            {
                CategoryId = id,
                CategoryName = "Restaurant"
            });
    }

    private static Business CreateBusiness(
        int id = 1,
        int ownerId = 10,
        int categoryId = 1,
        string name = "Test Business")
    {
        return new Business
        {
            BusinessId = id,
            OwnerId = ownerId,
            CategoryId = categoryId,
            BusinessName = name,
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

    private static CreateBusinessDto CreateDto()
    {
        return new CreateBusinessDto
        {
            BusinessName = "New Restaurant",
            CategoryId = 1,
            Description = "Great restaurant",
            PhoneNumber = "9876543210",
            Email = "restaurant@example.com",
            Address = "Main Road",
            City = "Pune",
            Pincode = "411001",
            Website = "https://example.com",
            OpeningTime = "09:00",
            ClosingTime = "22:00"
        };
    }

    private static UpdateBusinessDto CreateUpdateDto()
    {
        return new UpdateBusinessDto
        {
            BusinessName = "Updated Restaurant",
            CategoryId = 1,
            City = "Pune",
            IsOpen = false
        };
    }

    [Fact]
    public async Task GetMyBusinesses_ShouldReturnOk_WhenUserTokenIsValid()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);

        context.Businesses.AddRange(
            CreateBusiness(1, 10, 1, "My Business"),
            CreateBusiness(2, 20, 1, "Other Business"));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.GetMyBusinesses();

        var okResult = Assert.IsType<OkObjectResult>(result);

        var type = okResult.Value!.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Businesses fetched successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        Assert.NotNull(type.GetProperty("Data")!.GetValue(okResult.Value));
    }

    [Fact]
    public async Task GetMyBusinesses_ShouldReturnUnauthorized_WhenUserTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, "invalid");

        var result = await controller.GetMyBusinesses();

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);

        var type = unauthorized.Value!.GetType();

        Assert.Equal(false, type.GetProperty("Success")!.GetValue(unauthorized.Value));
        Assert.Equal(
            "Invalid user token.",
            type.GetProperty("Message")!.GetValue(unauthorized.Value));
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnOk_WhenBusinessBelongsToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness());

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.GetBusiness(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Business fetched successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var data = type.GetProperty("Data")!.GetValue(okResult.Value);
        Assert.NotNull(data);
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnUnauthorized_WhenUserTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, null);

        var result = await controller.GetBusiness(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness(1, 10));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "99");

        var result = await controller.GetBusiness(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var type = notFound.Value!.GetType();

        Assert.Equal(false, type.GetProperty("Success")!.GetValue(notFound.Value));
        Assert.Equal(
            "Business not found.",
            type.GetProperty("Message")!.GetValue(notFound.Value));
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnOk_WhenRequestIsValid()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.CreateBusiness(CreateDto());

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Business created successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var data = type.GetProperty("Data")!.GetValue(okResult.Value);
        Assert.NotNull(data);

        Assert.Single(context.Businesses);
        Assert.Equal(10, context.Businesses.Single().OwnerId);
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnUnauthorized_WhenUserTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "invalid");

        var result = await controller.CreateBusiness(CreateDto());

        Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Empty(context.Businesses);
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        controller.ModelState.AddModelError(
            "BusinessName",
            "Business name is required.");

        var result = await controller.CreateBusiness(CreateDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnOk_WhenBusinessBelongsToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness());

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.UpdateBusiness(1, CreateUpdateDto());

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Business updated successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var business = await context.Businesses.FindAsync(1);

        Assert.NotNull(business);
        Assert.Equal("Updated Restaurant", business!.BusinessName);
        Assert.False(business.IsOpen);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnUnauthorized_WhenUserTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, null);

        var result = await controller.UpdateBusiness(
            1,
            CreateUpdateDto());

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness(1, 10));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "99");

        var result = await controller.UpdateBusiness(
            1,
            CreateUpdateDto());

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var type = notFound.Value!.GetType();

        Assert.Equal(
            "Business not found or you are not the owner.",
            type.GetProperty("Message")!.GetValue(notFound.Value));
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        controller.ModelState.AddModelError(
            "BusinessName",
            "Invalid business name.");

        var result = await controller.UpdateBusiness(
            1,
            CreateUpdateDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnOk_WhenBusinessBelongsToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness());

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "10");

        var result = await controller.DeleteBusiness(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Business deleted successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        var business = await context.Businesses.FindAsync(1);

        Assert.NotNull(business);
        Assert.False(business!.IsActive);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnUnauthorized_WhenUserTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var controller = CreateController(service, "invalid");

        var result = await controller.DeleteBusiness(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        AddCategory(context);
        context.Businesses.Add(CreateBusiness(1, 10));

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var controller = CreateController(service, "99");

        var result = await controller.DeleteBusiness(1);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        var type = notFound.Value!.GetType();

        Assert.Equal(
            "Business not found or you are not the owner.",
            type.GetProperty("Message")!.GetValue(notFound.Value));
    }
}
