using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Review.API.Controllers;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class OwnerPhotoControllerTests
{
    private static OwnerPhotoController CreateController(
        OwnerService service,
        Microsoft.AspNetCore.Hosting.IWebHostEnvironment environment,
        string? userId = "10")
    {
        var controller = new OwnerPhotoController(service, environment);

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

    private static Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment> CreateEnvironment(
        string webRoot)
    {
        var environment = new Mock<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(webRoot);
        return environment;
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
            BusinessName = "Test Business",
            Description = "Test Description",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "Main Road",
            City = "Pune",
            Pincode = "411001",
            IsOpen = true,
            IsApproved = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static IFormFile CreateFormFile(
        string fileName,
        byte[] content)
    {
        var stream = new MemoryStream(content);

        return new FormFile(
            stream,
            0,
            content.Length,
            "Photo",
            fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };
    }

    private static OwnerPhotoDto CreatePhotoDto(
        string fileName = "photo.jpg",
        byte[]? content = null)
    {
        return new OwnerPhotoDto
        {
            Caption = "Test Photo",
            IsPrimary = true,
            Photo = CreateFormFile(
                fileName,
                content ?? new byte[] { 1, 2, 3, 4 })
        };
    }

    [Fact]
    public async Task GetPhotos_ShouldReturnOk_WhenTokenIsValid()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness());

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/uploads/business/photo.jpg",
                Caption = "Test",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "10");

        var result = await controller.GetPhotos(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var type = okResult.Value!.GetType();

        Assert.Equal(
            true,
            type.GetProperty("Success")!.GetValue(okResult.Value));

        Assert.Equal(
            "Business photos fetched successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));

        Assert.NotNull(
            type.GetProperty("Data")!.GetValue(okResult.Value));
    }

    [Fact]
    public async Task GetPhotos_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "invalid");

        var result = await controller.GetPhotos(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnBadRequest_WhenPhotoIsMissing()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object);

        var dto = new OwnerPhotoDto
        {
            Caption = "No Photo",
            IsPrimary = true,
            Photo = null
        };

        var result = await controller.AddPhoto(1, dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var type = badRequest.Value!.GetType();

        Assert.Equal(
            "Please select a photo.",
            type.GetProperty("Message")!.GetValue(badRequest.Value));
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnBadRequest_WhenFileIsTooLarge()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object);

        var largeContent = new byte[(5 * 1024 * 1024) + 1];

        var dto = CreatePhotoDto(
            "large.jpg",
            largeContent);

        var result = await controller.AddPhoto(1, dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var type = badRequest.Value!.GetType();

        Assert.Equal(
            "Photo size must not exceed 5 MB.",
            type.GetProperty("Message")!.GetValue(badRequest.Value));
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnBadRequest_WhenExtensionIsNotAllowed()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object);

        var dto = CreatePhotoDto("document.pdf");

        var result = await controller.AddPhoto(1, dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        var type = badRequest.Value!.GetType();

        Assert.Equal(
            "Only JPG, JPEG, PNG and WEBP images are allowed.",
            type.GetProperty("Message")!.GetValue(badRequest.Value));
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "invalid");

        var dto = CreatePhotoDto();

        var result = await controller.AddPhoto(1, dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnNotFound_WhenBusinessDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1, 20));
        await context.SaveChangesAsync();

        var webRoot = Path.Combine(
            Path.GetTempPath(),
            "ReviewApiTests",
            Guid.NewGuid().ToString());

        Directory.CreateDirectory(webRoot);

        try
        {
            var service = new OwnerService(context);
            var environment = CreateEnvironment(webRoot);

            var controller =
                CreateController(service, environment.Object, "10");

            var result =
                await controller.AddPhoto(
                    1,
                    CreatePhotoDto());

            var notFound =
                Assert.IsType<NotFoundObjectResult>(result);

            var type = notFound.Value!.GetType();

            Assert.Equal(
                "Business not found or you are not the owner.",
                type.GetProperty("Message")!
                    .GetValue(notFound.Value));

            var uploadFolder =
                Path.Combine(
                    webRoot,
                    "uploads",
                    "business");

            Assert.False(
                Directory.Exists(uploadFolder) &&
                Directory.GetFiles(uploadFolder).Length > 0);
        }
        finally
        {
            if (Directory.Exists(webRoot))
                Directory.Delete(webRoot, true);
        }
    }

    [Fact]
    public async Task AddPhoto_ShouldReturnOk_AndSavePhysicalFile()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness());

        await context.SaveChangesAsync();

        var webRoot = Path.Combine(
            Path.GetTempPath(),
            "ReviewApiTests",
            Guid.NewGuid().ToString());

        Directory.CreateDirectory(webRoot);

        try
        {
            var service = new OwnerService(context);
            var environment = CreateEnvironment(webRoot);

            var controller =
                CreateController(service, environment.Object, "10");

            var dto = CreatePhotoDto(
                "photo.jpg",
                new byte[] { 10, 20, 30, 40 });

            var result =
                await controller.AddPhoto(1, dto);

            var okResult =
                Assert.IsType<OkObjectResult>(result);

            var type = okResult.Value!.GetType();

            Assert.Equal(
                true,
                type.GetProperty("Success")!
                    .GetValue(okResult.Value));

            Assert.Equal(
                "Business photo added successfully.",
                type.GetProperty("Message")!
                    .GetValue(okResult.Value));

            var photo =
                Assert.Single(context.BusinessPhotos);

            Assert.Equal(1, photo.BusinessId);
            Assert.True(photo.IsPrimary);
            Assert.StartsWith(
                "/uploads/business/",
                photo.PhotoUrl);

            var physicalFolder =
                Path.Combine(
                    webRoot,
                    "uploads",
                    "business");

            Assert.True(Directory.Exists(physicalFolder));
            Assert.Single(Directory.GetFiles(physicalFolder));
        }
        finally
        {
            if (Directory.Exists(webRoot))
                Directory.Delete(webRoot, true);
        }
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "invalid");

        var result = await controller.DeletePhoto(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnNotFound_WhenPhotoDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1, 20));

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/uploads/business/photo.jpg",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "10");

        var result = await controller.DeletePhoto(1);

        var notFound =
            Assert.IsType<NotFoundObjectResult>(result);

        var type = notFound.Value!.GetType();

        Assert.Equal(
            "Photo not found or you are not the owner.",
            type.GetProperty("Message")!
                .GetValue(notFound.Value));
    }

    [Fact]
    public async Task DeletePhoto_ShouldReturnOk_AndDeletePhysicalFile()
    {
        await using var context = TestDbContextFactory.Create();

        var webRoot = Path.Combine(
            Path.GetTempPath(),
            "ReviewApiTests",
            Guid.NewGuid().ToString());

        var uploadFolder =
            Path.Combine(
                webRoot,
                "uploads",
                "business");

        Directory.CreateDirectory(uploadFolder);

        var fileName = "photo.jpg";
        var physicalFile =
            Path.Combine(uploadFolder, fileName);

        await File.WriteAllBytesAsync(
            physicalFile,
            new byte[] { 1, 2, 3 });

        context.Businesses.Add(CreateBusiness());

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/uploads/business/photo.jpg",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        try
        {
            var service = new OwnerService(context);
            var environment = CreateEnvironment(webRoot);

            var controller =
                CreateController(service, environment.Object, "10");

            var result = await controller.DeletePhoto(1);

            var okResult =
                Assert.IsType<OkObjectResult>(result);

            var type = okResult.Value!.GetType();

            Assert.Equal(
                true,
                type.GetProperty("Success")!
                    .GetValue(okResult.Value));

            Assert.Equal(
                "Business photo deleted successfully.",
                type.GetProperty("Message")!
                    .GetValue(okResult.Value));

            Assert.False(File.Exists(physicalFile));
            Assert.Null(
                await context.BusinessPhotos.FindAsync(1));
        }
        finally
        {
            if (Directory.Exists(webRoot))
                Directory.Delete(webRoot, true);
        }
    }

    [Fact]
    public async Task SetPrimaryPhoto_ShouldReturnUnauthorized_WhenTokenIsInvalid()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "invalid");

        var result = await controller.SetPrimaryPhoto(1);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task SetPrimaryPhoto_ShouldReturnNotFound_WhenPhotoDoesNotBelongToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness(1, 20));

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/photo.jpg",
                IsPrimary = false
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "10");

        var result = await controller.SetPrimaryPhoto(1);

        var notFound =
            Assert.IsType<NotFoundObjectResult>(result);

        var type = notFound.Value!.GetType();

        Assert.Equal(
            "Photo not found or you are not the owner.",
            type.GetProperty("Message")!
                .GetValue(notFound.Value));
    }

    [Fact]
    public async Task SetPrimaryPhoto_ShouldReturnOk_WhenPhotoBelongsToOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(CreateBusiness());

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/old.jpg",
                IsPrimary = true
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 1,
                PhotoUrl = "/new.jpg",
                IsPrimary = false
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);
        var environment = CreateEnvironment("wwwroot");

        var controller =
            CreateController(service, environment.Object, "10");

        var result = await controller.SetPrimaryPhoto(2);

        var okResult =
            Assert.IsType<OkObjectResult>(result);

        var type = okResult.Value!.GetType();

        Assert.Equal(
            true,
            type.GetProperty("Success")!
                .GetValue(okResult.Value));

        Assert.Equal(
            "Primary photo updated successfully.",
            type.GetProperty("Message")!
                .GetValue(okResult.Value));

        var oldPhoto =
            await context.BusinessPhotos.FindAsync(1);

        var newPhoto =
            await context.BusinessPhotos.FindAsync(2);

        Assert.False(oldPhoto!.IsPrimary);
        Assert.True(newPhoto!.IsPrimary);
    }
}
