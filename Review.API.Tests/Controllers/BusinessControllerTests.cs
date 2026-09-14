using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;
using System.Security.Claims;

namespace Review.API.Tests.Controllers;

public class BusinessControllerTests
{
    private static BusinessController CreateController(
        BusinessService service,
        int? userId = null)
    {
        var controller = new BusinessController(service);

        var claims = new List<Claim>();

        if (userId.HasValue)
        {
            claims.Add(
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId.Value.ToString()));
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
        int id,
        int ownerId = 10,
        int categoryId = 7,
        string name = "Test Business",
        bool isActive = true,
        bool isApproved = true,
        double rating = 4.5)
    {
        return new Business
        {
            BusinessId = id,
            OwnerId = ownerId,
            CategoryId = categoryId,
            BusinessName = name,
            Description = "Test business description",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Test Address",
            City = "Pune",
            Pincode = "411001",
            Website = "https://example.com",
            OpeningTime = "09:00",
            ClosingTime = "21:00",
            IsOpen = true,
            IsApproved = isApproved,
            IsActive = isActive,
            Rating = rating,
            ReviewCount = 5,
            CreatedAt = DateTime.UtcNow
        };
    }

    // =========================================================
    // GET BUSINESSES
    // =========================================================

    [Fact]
    public async Task GetBusinesses_ShouldReturnOkWithBusinesses()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(1, name: "Business One"));

        context.Businesses.Add(
            CreateBusiness(
                2,
                name: "Inactive Business",
                isActive: false));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetBusinesses();

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);
    }

    // =========================================================
    // GET BUSINESS BY ID
    // =========================================================

    [Fact]
    public async Task GetBusiness_ShouldReturnOk_WhenBusinessExists()
    {
        using var context = TestDbContextFactory.Create();

        var category = new Category { CategoryId = 7, CategoryName = "Bakery" };
        context.Categories.Add(category);

        var business = CreateBusiness(5, name: "Existing Business");
        context.Businesses.Add(business);
        await context.SaveChangesAsync();

        var saved = await context.Businesses.FirstAsync();
        Assert.Equal(5, saved.BusinessId);
        Assert.True(saved.IsActive);
        Assert.True(saved.IsApproved);

        var savedCategory = await context.Categories.FirstOrDefaultAsync(x => x.CategoryId == 7);
        Assert.NotNull(savedCategory);

        var directResult = await context.Businesses.FirstOrDefaultAsync(x => x.BusinessId == 5 && x.IsActive && x.IsApproved);
        Assert.NotNull(directResult);

        var service = new BusinessService(context);
        var serviceResult = await service.GetBusinessByIdAsync(5);
        Assert.NotNull(serviceResult);

        var controller = CreateController(service);
        var result = await controller.GetBusiness(5);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnNotFound_WhenBusinessDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetBusiness(99);

        var notFoundResult =
            Assert.IsType<NotFoundObjectResult>(result);

        Assert.NotNull(notFoundResult.Value);
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnNotFound_WhenBusinessIsInactive()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                isActive: false));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetBusiness(5);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetBusiness_ShouldReturnNotFound_WhenBusinessIsNotApproved()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                isApproved: false));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetBusiness(5);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    // =========================================================
    // GET BY CATEGORY
    // =========================================================

    [Fact]
    public async Task GetByCategory_ShouldReturnOkWithBusinesses()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                categoryId: 7,
                name: "Gym One"));

        context.Businesses.Add(
            CreateBusiness(
                2,
                categoryId: 8,
                name: "Bakery One"));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetByCategory(7);

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);
    }

    // =========================================================
    // SEARCH
    // =========================================================

    [Fact]
    public async Task Search_ShouldReturnOkWithSearchResults()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                name: "Pizza Point"));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        // Empty search uses GetPublicBusinessesAsync()
        // which is compatible with InMemory database.
        var result = await controller.Search("");

        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);
    }

    // =========================================================
    // CREATE BUSINESS
    // =========================================================

    [Fact]
    public async Task CreateBusiness_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service, 25);

        controller.ModelState.AddModelError(
            "BusinessName",
            "Business name is required.");

        context.Users.Add(new User { Id = 10, FullName = "Test Owner", Email = "owner@test.com", MobileNumber = "9999999999", Role = "BusinessOwner", IsEmailVerified = true });
        context.Categories.Add(new Category { CategoryId = 7, CategoryName = "Test Category" });
        await context.SaveChangesAsync();

        var dto = new CreateBusinessDto
        {
            CategoryId = 7,
            BusinessName = "",
            Description = "Test",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Pune",
            City = "Pune",
            Pincode = "411001"
        };

        var result =
            await controller.CreateBusiness(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnUnauthorized_WhenUserIdClaimIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        context.Users.Add(new User { Id = 10, FullName = "Test Owner", Email = "owner@test.com", MobileNumber = "9999999999", Role = "BusinessOwner", IsEmailVerified = true });
        context.Categories.Add(new Category { CategoryId = 7, CategoryName = "Test Category" });
        await context.SaveChangesAsync();

        var dto = new CreateBusinessDto
        {
            CategoryId = 7,
            BusinessName = "New Business",
            Description = "Test",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Pune",
            City = "Pune",
            Pincode = "411001"
        };

        var result =
            await controller.CreateBusiness(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnUnauthorized_WhenUserIdClaimIsNotNumeric()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = new BusinessController(service);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(
                    new ClaimsIdentity(
                        new[]
                        {
                            new Claim(
                                ClaimTypes.NameIdentifier,
                                "invalid-id")
                        },
                        "TestAuth"))
            }
        };

        context.Users.Add(new User { Id = 10, FullName = "Test Owner", Email = "owner@test.com", MobileNumber = "9999999999", Role = "BusinessOwner", IsEmailVerified = true });
        context.Categories.Add(new Category { CategoryId = 7, CategoryName = "Test Category" });
        await context.SaveChangesAsync();

        var dto = new CreateBusinessDto
        {
            CategoryId = 7,
            BusinessName = "New Business",
            Description = "Test",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Pune",
            City = "Pune",
            Pincode = "411001"
        };

        var result =
            await controller.CreateBusiness(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task CreateBusiness_ShouldReturnOk_WhenTokenIsValid()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service, 25);

        context.Users.Add(new User { Id = 10, FullName = "Test Owner", Email = "owner@test.com", MobileNumber = "9999999999", Role = "BusinessOwner", IsEmailVerified = true });
        context.Categories.Add(new Category { CategoryId = 7, CategoryName = "Test Category" });
        await context.SaveChangesAsync();

        var dto = new CreateBusinessDto
        {
            CategoryId = 7,
            BusinessName = "New Business",
            Description = "Test Description",
            PhoneNumber = "9876543210",
            Email = "new@example.com",
            Address = "Main Road",
            City = "Pune",
            Pincode = "411001",
            Website = "https://example.com",
            OpeningTime = "09:00",
            ClosingTime = "21:00"
        };

        var result =
            await controller.CreateBusiness(dto);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);

        var createdBusiness =
            Assert.Single(
                context.Businesses
                    .Where(x =>
                        x.BusinessName == "New Business"));

        Assert.Equal(25, createdBusiness.OwnerId);
        Assert.True(createdBusiness.IsActive);
        Assert.True(createdBusiness.IsApproved);
    }

    // =========================================================
    // UPDATE BUSINESS
    // =========================================================

    [Fact]
    public async Task UpdateBusiness_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var controller = CreateController(service, 10);

        controller.ModelState.AddModelError(
            "BusinessName",
            "Invalid business name.");

        var dto = new UpdateBusinessDto
        {
            BusinessName = "",
            Description = "Updated"
        };

        var result =
            await controller.UpdateBusiness(5, dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnUnauthorized_WhenUserIdClaimIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "Updated Business",
            Description = "Updated"
        };

        var result =
            await controller.UpdateBusiness(5, dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        // Logged-in owner is 20, but business belongs to 10.
        var controller = CreateController(service, 20);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "Updated Business",
            Description = "Updated"
        };

        var result =
            await controller.UpdateBusiness(5, dto);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBusiness_ShouldReturnOk_WhenUpdateSucceeds()
    {
        using var context = TestDbContextFactory.Create();

        context.Categories.Add(new Category { CategoryId = 7, CategoryName = "Bakery" });

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10,
                name: "Old Business"));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var controller = CreateController(service, 10);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "Updated Business",
            Description = "Updated Description",
            CategoryId = 7,
            PhoneNumber = "9999999999",
            Email = "updated@example.com",
            Address = "Updated Address",
            City = "Mumbai",
            Pincode = "400001",
            Website = "https://updated.com",
            OpeningTime = "10:00",
            ClosingTime = "22:00",
            IsOpen = false
        };

        var result =
            await controller.UpdateBusiness(5, dto);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);

        var updated =
            await context.Businesses.FindAsync(5);

        Assert.NotNull(updated);
        Assert.Equal("Updated Business", updated.BusinessName);
        Assert.Equal("Mumbai", updated.City);
        Assert.False(updated.IsOpen);
    }

    // =========================================================
    // DELETE BUSINESS
    // =========================================================

    [Fact]
    public async Task DeleteBusiness_ShouldReturnUnauthorized_WhenUserIdClaimIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result =
            await controller.DeleteBusiness(5);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service, 20);

        var result =
            await controller.DeleteBusiness(5);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnNotFound_WhenBusinessDoesNotExist()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);

        var controller = CreateController(service, 10);

        var result =
            await controller.DeleteBusiness(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteBusiness_ShouldReturnOk_WhenDeleteSucceeds()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                5,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var controller = CreateController(service, 10);

        var result =
            await controller.DeleteBusiness(5);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        Assert.NotNull(okResult.Value);

        var deleted =
            await context.Businesses.FindAsync(5);

        Assert.NotNull(deleted);
        Assert.False(deleted.IsActive);
    }
}























