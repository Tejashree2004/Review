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

public class BusinessPhotoControllerTests
{
    private static BusinessPhotoController CreateController(
        BusinessService service,
        int? userId = null)
    {
        var controller = new BusinessPhotoController(service);

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
        bool isActive = true)
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
            IsActive = isActive,
            Rating = 4.5,
            ReviewCount = 5,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static BusinessPhoto CreatePhoto(
        int id,
        int businessId,
        string url = "/uploads/photo.jpg",
        bool isPrimary = false)
    {
        return new BusinessPhoto
        {
            BusinessPhotoId = id,
            BusinessId = businessId,
            PhotoUrl = url,
            Caption = "Test Photo",
            IsPrimary = isPrimary,
            CreatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task GetPhotos_ShouldReturnOkWithPhotos()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1));
        context.BusinessPhotos.Add(
            CreatePhoto(1, 1, isPrimary: true));
        context.BusinessPhotos.Add(
            CreatePhoto(2, 1));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetPhotos(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task GetPhotos_ShouldReturnEmptyList_WhenBusinessHasNoPhotos()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1));
        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.GetPhotos(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service, 10);

        controller.ModelState.AddModelError(
            "PhotoUrl",
            "Photo URL is invalid.");

        var dto = new BusinessPhotoDto
        {
            BusinessId = 1,
            PhotoUrl = "",
            Caption = "Test"
        };

        var result = await controller.AddPhoto(1, dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnUnauthorized_WhenUserIdClaimIsMissing()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1, ownerId: 10));
        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var dto = new BusinessPhotoDto
        {
            BusinessId = 1,
            PhotoUrl = "/uploads/test.jpg",
            Caption = "Test Photo",
            IsPrimary = false
        };

        var result = await controller.AddPhoto(1, dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service, 20);

        var dto = new BusinessPhotoDto
        {
            BusinessId = 1,
            PhotoUrl = "/uploads/test.jpg",
            Caption = "Test Photo",
            IsPrimary = false
        };

        var result = await controller.AddPhoto(1, dto);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnOk_WhenPhotoIsAdded()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                ownerId: 10));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service, 10);

        var dto = new BusinessPhotoDto
        {
            BusinessId = 1,
            PhotoUrl = "  /uploads/new-photo.jpg  ",
            Caption = "  New Photo  ",
            IsPrimary = true
        };

        var result = await controller.AddPhoto(1, dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var photo = context.BusinessPhotos
            .Single();

        Assert.Equal("/uploads/new-photo.jpg", photo.PhotoUrl);
        Assert.Equal("New Photo", photo.Caption);
        Assert.True(photo.IsPrimary);
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnUnauthorized_WhenUserIdClaimIsMissing()
    {
        using var context = TestDbContextFactory.Create();

        var service = new BusinessService(context);
        var controller = CreateController(service);

        var result = await controller.DeletePhoto(1, 1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnNotFound_WhenPhotoDoesNotBelongToOwner()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                ownerId: 10));

        context.BusinessPhotos.Add(
            CreatePhoto(
                1,
                1));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service, 20);

        var result = await controller.DeletePhoto(1, 1);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnOk_WhenPhotoIsDeleted()
    {
        using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            CreateBusiness(
                1,
                ownerId: 10));

        context.BusinessPhotos.Add(
            CreatePhoto(
                1,
                1,
                isPrimary: false));

        await context.SaveChangesAsync();

        var service = new BusinessService(context);
        var controller = CreateController(service, 10);

        var result = await controller.DeletePhoto(1, 1);

        Assert.IsType<OkObjectResult>(result);

        var deletedPhoto =
            await context.BusinessPhotos.FindAsync(1);

        Assert.Null(deletedPhoto);
    }
}
