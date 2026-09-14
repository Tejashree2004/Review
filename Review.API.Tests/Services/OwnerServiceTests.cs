using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Services;

public class OwnerServiceTests
{
    [Fact]
    public async Task GetOwnerBusinessesAsync_ShouldReturnOnlyActiveBusinessesForOwner()
    {
        await using var context = TestDbContextFactory.Create();

        
        context.Categories.Add(new Category { CategoryId = 1, CategoryName = "Test Category" });
context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1, OwnerId = 10, CategoryId = 1,
                BusinessName = "Active Business",
                IsActive = true
            },
            new Business
            {
                BusinessId = 2, OwnerId = 10, CategoryId = 1,
                BusinessName = "Inactive Business",
                IsActive = false
            },
            new Business
            {
                BusinessId = 3, OwnerId = 20, CategoryId = 1,
                BusinessName = "Other Owner",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerBusinessesAsync(10);

        var business = Assert.Single(result);
        Assert.Equal("Active Business", business.BusinessName);
    }

    [Fact]
    public async Task GetOwnerBusinessAsync_ShouldReturnBusinessForCorrectOwner()
    {
        await using var context = TestDbContextFactory.Create();

        
        context.Categories.Add(new Category { CategoryId = 1, CategoryName = "Test Category" });
context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "My Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerBusinessAsync(1, 10);

        Assert.NotNull(result);
        Assert.Equal("My Business", result.BusinessName);
    }

    [Fact]
    public async Task GetOwnerBusinessAsync_ShouldReturnNull_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Protected Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerBusinessAsync(1, 99);

        Assert.Null(result);
    }

    [Fact]
    public async Task OwnerBusinessExistsAsync_ShouldReturnTrueForValidOwnerBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Existing Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.OwnerBusinessExistsAsync(1, 10);

        Assert.True(result);
    }

    [Fact]
    public async Task OwnerBusinessExistsAsync_ShouldReturnFalseForWrongOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Existing Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.OwnerBusinessExistsAsync(1, 99);

        Assert.False(result);
    }

    [Fact]
    public async Task CreateBusinessAsync_ShouldCreateApprovedActiveBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new CreateBusinessDto
        {
            BusinessName = "  New Restaurant  ",
            CategoryId = 1,
            Description = "  Great food  ",
            PhoneNumber = "9876543210",
            Email = "test@example.com",
            Address = "  Main Road  ",
            City = "  Pune  ",
            Pincode = "411001",
            Website = "  https://example.com  ",
            OpeningTime = "09:00",
            ClosingTime = "22:00"
        };

        var result = await service.CreateBusinessAsync(10, dto);

        Assert.Equal(10, result.OwnerId);
        Assert.Equal("New Restaurant", result.BusinessName);
        Assert.Equal("Great food", result.Description);
        Assert.Equal("Main Road", result.Address);
        Assert.Equal("Pune", result.City);
        Assert.True(result.IsActive);
        Assert.True(result.IsApproved);
        Assert.True(result.IsOpen);
        Assert.Equal(0, result.Rating);
        Assert.Equal(0, result.ReviewCount);
        Assert.NotNull(result.Category);
    }

    [Fact]
    public async Task UpdateBusinessAsync_ShouldUpdateBusinessForCorrectOwner()
    {
        await using var context = TestDbContextFactory.Create();

        
        context.Categories.AddRange(
            new Category { CategoryId = 1, CategoryName = "Old Category" },
            new Category { CategoryId = 2, CategoryName = "New Category" });
context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Old Name",
                City = "Old City",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "  Updated Name  ",
            CategoryId = 2,
            City = "  Pune  ",
            IsOpen = false
        };

        var result = await service.UpdateBusinessAsync(1, 10, dto);

        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.BusinessName);
        Assert.Equal(2, result.CategoryId);
        Assert.Equal("Pune", result.City);
        Assert.False(result.IsOpen);
        Assert.NotNull(result.UpdatedAt);
    }

    [Fact]
    public async Task UpdateBusinessAsync_ShouldReturnNull_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Protected Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "Hacked Name",
            CategoryId = 2
        };

        var result = await service.UpdateBusinessAsync(1, 99, dto);

        Assert.Null(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.Equal("Protected Business", business!.BusinessName);
    }

    [Fact]
    public async Task DeleteBusinessAsync_ShouldDeactivateBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.DeleteBusinessAsync(1, 10);

        Assert.True(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.False(business!.IsActive);
        Assert.NotNull(business.UpdatedAt);
    }

    [Fact]
    public async Task DeleteBusinessAsync_ShouldReturnFalse_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Protected Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.DeleteBusinessAsync(1, 99);

        Assert.False(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.True(business!.IsActive);
    }

    [Fact]
    public async Task AddOwnerPhotoAsync_ShouldAddPhotoAndDemoteExistingPrimary()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Photo Business",
                IsActive = true
            });

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/old.jpg",
                IsPrimary = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new OwnerPhotoDto
        {
            Caption = "New Cover",
            IsPrimary = true
        };

        var result = await service.AddOwnerPhotoAsync(
            1,
            10,
            dto,
            " /new.jpg ");

        Assert.NotNull(result);
        Assert.Equal("/new.jpg", result.PhotoUrl);
        Assert.Equal("New Cover", result.Caption);
        Assert.True(result.IsPrimary);

        var oldPhoto = await context.BusinessPhotos.FindAsync(1);
        Assert.NotNull(oldPhoto);
        Assert.False(oldPhoto.IsPrimary);
    }

    [Fact]
    public async Task AddOwnerPhotoAsync_ShouldReturnNull_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Protected Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new OwnerPhotoDto
        {
            Caption = "Unauthorized",
            IsPrimary = true
        };

        var result = await service.AddOwnerPhotoAsync(
            1,
            99,
            dto,
            "/photo.jpg");

        Assert.Null(result);
        Assert.Empty(context.BusinessPhotos);
    }

    [Fact]
    public async Task GetOwnerPhotosAsync_ShouldReturnOnlyOwnerPhotos()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "My Business",
                IsActive = true
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 20,
                CategoryId = 1,
                BusinessName = "Other Business",
                IsActive = true
            });

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/my.jpg",
                IsPrimary = true
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 2,
                PhotoUrl = "/other.jpg",
                IsPrimary = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerPhotosAsync(1, 10);

        var photo = Assert.Single(result);
        Assert.Equal("/my.jpg", photo.PhotoUrl);
    }

    [Fact]
    public async Task GetOwnerPhotoByIdAsync_ShouldReturnPhotoForCorrectOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/photo.jpg"
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerPhotoByIdAsync(1, 10);

        Assert.NotNull(result);
        Assert.Equal("/photo.jpg", result.PhotoUrl);
    }

    [Fact]
    public async Task DeleteOwnerPhotoAsync_ShouldPromoteLatestPhoto_WhenPrimaryIsDeleted()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/primary.jpg",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 1,
                PhotoUrl = "/latest.jpg",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.DeleteOwnerPhotoAsync(1, 10);

        Assert.True(result);

        var remainingPhoto = await context.BusinessPhotos.FindAsync(2);

        Assert.NotNull(remainingPhoto);
        Assert.True(remainingPhoto.IsPrimary);
    }

    [Fact]
    public async Task SetPrimaryPhotoAsync_ShouldMakeOnlySelectedPhotoPrimary()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

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

        var result = await service.SetPrimaryPhotoAsync(2, 10);

        Assert.NotNull(result);

        var oldPhoto = await context.BusinessPhotos.FindAsync(1);
        var newPhoto = await context.BusinessPhotos.FindAsync(2);

        Assert.False(oldPhoto!.IsPrimary);
        Assert.True(newPhoto!.IsPrimary);
    }

    [Fact]
    public async Task SetPrimaryPhotoAsync_ShouldReturnNull_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

        context.BusinessPhotos.Add(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "/photo.jpg"
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.SetPrimaryPhotoAsync(1, 99);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetOwnerReviewsAsync_ShouldReturnReviewsForOwnerBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        
        context.Categories.Add(new Category { CategoryId = 1, CategoryName = "Test Category" });

        context.Users.AddRange(
            new User { Id = 1, FullName = "User One", Email = "user1@test.com", MobileNumber = "9000000001", PasswordHash = "hash" },
            new User { Id = 2, FullName = "User Two", Email = "user2@test.com", MobileNumber = "9000000002", PasswordHash = "hash" },
            new User { Id = 10, FullName = "Owner", Email = "owner@test.com", MobileNumber = "9000000010", PasswordHash = "hash", Role = "BusinessOwner" });
context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
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
                Rating = 4,
                Comment = "Good"
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerReviewsAsync(1, 10);

        Assert.Equal(2, result.Count);
        Assert.Contains(result, x => x.Rating == 5);
        Assert.Contains(result, x => x.Rating == 4);
    }

    [Fact]
    public async Task GetOwnerReviewsAsync_ShouldReturnEmpty_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Business",
                IsActive = true
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var result = await service.GetOwnerReviewsAsync(1, 99);

        Assert.Empty(result);
    }

    [Fact]
    public async Task ReplyToReviewAsync_ShouldReturnNull_WhenReviewIsNotForAPlace()
    {
        await using var context = TestDbContextFactory.Create();

        context.Reviews.Add(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                BusinessId = 1,
                Rating = 5,
                Comment = "Business review"
            });

        await context.SaveChangesAsync();

        var service = new OwnerService(context);

        var dto = new OwnerReplyDto
        {
            ReviewId = 1,
            Reply = "Thank you"
        };

        var result = await service.ReplyToReviewAsync(1, 10, dto);

        Assert.Null(result);
    }
}






