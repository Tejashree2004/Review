using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Services;

public class BusinessServiceTests
{
    [Fact]
    public async Task CreateBusinessAsync_ShouldCreateActiveApprovedBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var dto = new CreateBusinessDto
        {
            CategoryId = 1,
            BusinessName = "  Test Restaurant  ",
            Description = "  Good food  ",
            PhoneNumber = "9999999999",
            Email = "test@restaurant.com",
            Address = "  Main Road  ",
            City = "  Pune  ",
            Pincode = "411001",
            Website = "https://test.com",
            OpeningTime = "10:00 AM",
            ClosingTime = "10:00 PM"
        };

        var result = await service.CreateBusinessAsync(10, dto);

        Assert.NotNull(result);
        Assert.Equal(10, result.OwnerId);
        Assert.Equal(1, result.CategoryId);
        Assert.Equal("Test Restaurant", result.BusinessName);
        Assert.Equal("Good food", result.Description);
        Assert.Equal("Main Road", result.Address);
        Assert.Equal("Pune", result.City);
        Assert.True(result.IsApproved);
        Assert.True(result.IsActive);
        Assert.True(result.IsOpen);
        Assert.Equal(0, result.Rating);
        Assert.Equal(0, result.ReviewCount);
        Assert.NotNull(result.Category);
    }
    [Fact]
    public async Task GetBusinessByIdAsync_ShouldReturnOnlyActiveApprovedBusiness()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Public Business",
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Inactive Business",
                IsActive = false,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 3,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Unapproved Business",
                IsActive = true,
                IsApproved = false
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.GetBusinessByIdAsync(1);
        var inactive = await service.GetBusinessByIdAsync(2);
        var unapproved = await service.GetBusinessByIdAsync(3);

        Assert.NotNull(result);
        Assert.Equal("Public Business", result.BusinessName);
        Assert.NotNull(result.Category);

        Assert.Null(inactive);
        Assert.Null(unapproved);
    }
    [Fact]
    public async Task GetPublicBusinessesAsync_ShouldReturnActiveApprovedBusinessesOrderedByRating()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Low Rated",
                Rating = 3.5,
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 11,
                CategoryId = 1,
                BusinessName = "Top Rated",
                Rating = 5.0,
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 3,
                OwnerId = 12,
                CategoryId = 1,
                BusinessName = "Inactive",
                Rating = 5.0,
                IsActive = false,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 4,
                OwnerId = 13,
                CategoryId = 1,
                BusinessName = "Unapproved",
                Rating = 5.0,
                IsActive = true,
                IsApproved = false
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.GetPublicBusinessesAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Top Rated", result[0].BusinessName);
        Assert.Equal("Low Rated", result[1].BusinessName);
        Assert.All(result, business =>
        {
            Assert.True(business.IsActive);
            Assert.True(business.IsApproved);
        });
    }
    [Fact]
    public async Task GetBusinessesByCategoryAsync_ShouldReturnOnlyMatchingCategory()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.AddRange(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant"
            },
            new Category
            {
                CategoryId = 2,
                CategoryName = "Gym"
            });

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Restaurant One",
                Rating = 4.5,
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 11,
                CategoryId = 2,
                BusinessName = "Gym One",
                Rating = 5.0,
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 3,
                OwnerId = 12,
                CategoryId = 1,
                BusinessName = "Inactive Restaurant",
                Rating = 5.0,
                IsActive = false,
                IsApproved = true
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.GetBusinessesByCategoryAsync(1);

        Assert.Single(result);
        Assert.Equal("Restaurant One", result[0].BusinessName);
        Assert.Equal(1, result[0].CategoryId);
        Assert.NotNull(result[0].Category);
        Assert.Equal("Restaurant", result[0].Category!.CategoryName);
    }
    [Fact]
    public async Task UpdateBusinessAsync_ShouldUpdateBusinessForCorrectOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Old Name",
            City = "Mumbai",
            IsActive = true,
            IsApproved = true
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "  Updated Restaurant  ",
            Description = "  Updated description  ",
            CategoryId = 1,
            PhoneNumber = "9999999999",
            Email = "updated@test.com",
            Address = "  New Address  ",
            City = "  Pune  ",
            Pincode = "411001",
            Website = "https://updated.com",
            OpeningTime = "09:00 AM",
            ClosingTime = "10:00 PM",
            IsOpen = false
        };

        var result = await service.UpdateBusinessAsync(1, 10, dto);

        Assert.NotNull(result);
        Assert.Equal("Updated Restaurant", result.BusinessName);
        Assert.Equal("Updated description", result.Description);
        Assert.Equal("New Address", result.Address);
        Assert.Equal("Pune", result.City);
        Assert.Equal("411001", result.Pincode);
        Assert.Equal("updated@test.com", result.Email);
        Assert.False(result.IsOpen);
        Assert.Equal(1, result.CategoryId);
    }
    [Fact]
    public async Task UpdateBusinessAsync_ShouldReturnNull_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Original Business",
            IsActive = true,
            IsApproved = true
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var dto = new UpdateBusinessDto
        {
            BusinessName = "Hacked Business",
            CategoryId = 1,
            IsOpen = true
        };

        var result = await service.UpdateBusinessAsync(1, 99, dto);

        Assert.Null(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.Equal("Original Business", business!.BusinessName);
        Assert.Equal(10, business.OwnerId);
    }
    [Fact]
    public async Task DeleteBusinessAsync_ShouldDeactivateBusinessForCorrectOwner()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Test Business",
            IsActive = true,
            IsApproved = true
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.DeleteBusinessAsync(1, 10);

        Assert.True(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.NotNull(business);
        Assert.False(business.IsActive);
        Assert.NotNull(business.UpdatedAt);
    }
    [Fact]
    public async Task DeleteBusinessAsync_ShouldReturnFalse_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Protected Business",
            IsActive = true,
            IsApproved = true
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.DeleteBusinessAsync(1, 99);

        Assert.False(result);

        var business = await context.Businesses.FindAsync(1);
        Assert.NotNull(business);
        Assert.True(business.IsActive);
    }
    [Fact]
    public async Task GetBusinessPhotosAsync_ShouldReturnPhotosWithPrimaryFirst()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Test Business",
            IsActive = true,
            IsApproved = true
        });

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "old.jpg",
                Caption = "Old",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 1,
                PhotoUrl = "primary.jpg",
                Caption = "Primary",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-20)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 3,
                BusinessId = 1,
                PhotoUrl = "new.jpg",
                Caption = "New",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.GetBusinessPhotosAsync(1);

        Assert.Equal(3, result.Count);
        Assert.Equal(2, result[0].BusinessPhotoId);
        Assert.True(result[0].IsPrimary);
        Assert.Equal(3, result[1].BusinessPhotoId);
        Assert.Equal(1, result[2].BusinessPhotoId);
    }
    [Fact]
    public async Task AddBusinessPhotoAsync_ShouldMakeNewPrimaryAndDemoteOldPrimary()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Test Business",
            IsActive = true,
            IsApproved = true
        });

        context.BusinessPhotos.Add(new BusinessPhoto
        {
            BusinessPhotoId = 1,
            BusinessId = 1,
            PhotoUrl = "old-primary.jpg",
            Caption = "Old Primary",
            IsPrimary = true,
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var dto = new BusinessPhotoDto
        {
            PhotoUrl = "new-primary.jpg",
            Caption = "New Primary",
            IsPrimary = true
        };

        var result = await service.AddBusinessPhotoAsync(1, 10, dto);

        Assert.NotNull(result);
        Assert.True(result.IsPrimary);
        Assert.Equal("new-primary.jpg", result.PhotoUrl);

        var photos = await context.BusinessPhotos
            .OrderBy(x => x.BusinessPhotoId)
            .ToListAsync();

        Assert.False(photos[0].IsPrimary);
        Assert.True(photos[1].IsPrimary);
    }

    [Fact]
    public async Task AddBusinessPhotoAsync_ShouldReturnNull_WhenOwnerIsWrongOrBusinessInactive()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.AddRange(
            new Business
            {
                BusinessId = 1,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Active Business",
                IsActive = true,
                IsApproved = true
            },
            new Business
            {
                BusinessId = 2,
                OwnerId = 10,
                CategoryId = 1,
                BusinessName = "Inactive Business",
                IsActive = false,
                IsApproved = true
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var dto = new BusinessPhotoDto
        {
            PhotoUrl = "test.jpg",
            Caption = "Test",
            IsPrimary = false
        };

        var wrongOwner = await service.AddBusinessPhotoAsync(1, 99, dto);
        var inactiveBusiness = await service.AddBusinessPhotoAsync(2, 10, dto);

        Assert.Null(wrongOwner);
        Assert.Null(inactiveBusiness);

        Assert.Empty(context.BusinessPhotos);
    }

    [Fact]
    public async Task DeleteBusinessPhotoAsync_ShouldPromoteLatestPhoto_WhenPrimaryIsDeleted()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Test Business",
            IsActive = true,
            IsApproved = true
        });

        context.BusinessPhotos.AddRange(
            new BusinessPhoto
            {
                BusinessPhotoId = 1,
                BusinessId = 1,
                PhotoUrl = "primary.jpg",
                Caption = "Primary",
                IsPrimary = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-20)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 2,
                BusinessId = 1,
                PhotoUrl = "older.jpg",
                Caption = "Older",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new BusinessPhoto
            {
                BusinessPhotoId = 3,
                BusinessId = 1,
                PhotoUrl = "latest.jpg",
                Caption = "Latest",
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.DeleteBusinessPhotoAsync(1, 1, 10);

        Assert.True(result);

        var photos = await context.BusinessPhotos
            .OrderBy(x => x.BusinessPhotoId)
            .ToListAsync();

        Assert.Equal(2, photos.Count);
        Assert.Equal(2, photos[0].BusinessPhotoId);
        Assert.Equal(3, photos[1].BusinessPhotoId);
        Assert.False(photos[0].IsPrimary);
        Assert.True(photos[1].IsPrimary);
    }
    [Fact]
    public async Task DeleteBusinessPhotoAsync_ShouldReturnFalse_WhenOwnerDoesNotMatch()
    {
        await using var context = TestDbContextFactory.Create();

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 10,
            CategoryId = 1,
            BusinessName = "Protected Business",
            IsActive = true,
            IsApproved = true
        });

        context.BusinessPhotos.Add(new BusinessPhoto
        {
            BusinessPhotoId = 1,
            BusinessId = 1,
            PhotoUrl = "protected.jpg",
            Caption = "Protected",
            IsPrimary = true
        });

        await context.SaveChangesAsync();

        var service = new BusinessService(context);

        var result = await service.DeleteBusinessPhotoAsync(1, 1, 99);

        Assert.False(result);

        var photo = await context.BusinessPhotos.FindAsync(1);
        Assert.NotNull(photo);
        Assert.True(photo.IsPrimary);
    }

}
