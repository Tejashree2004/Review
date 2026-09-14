using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;
using Xunit;

namespace Review.API.Tests.Services;

public class ReviewServiceTests
{
    [Fact]
    public async Task GetMyReviewsAsync_ShouldReturnOnlyCurrentUsersReviews()
    {
        // Arrange
        await using var context = TestDbContextFactory.Create();

        context.Users.AddRange(
            new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test1@example.com",
                MobileNumber = "9999999999",
                PasswordHash = "hashed",
                Role = "Reviewer"
            },
            new User
            {
                Id = 2,
                FullName = "Other User",
                Email = "test2@example.com",
                MobileNumber = "8888888888",
                PasswordHash = "hashed",
                Role = "Reviewer"
            }
        );

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                Rating = 5,
                Comment = "Excellent place",
                CreatedAt = new DateTime(2026, 1, 1)
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 2,
                Rating = 3,
                Comment = "Average place",
                CreatedAt = new DateTime(2026, 1, 2)
            }
        );

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns((HttpContext?)null);

        var service = new ReviewService(
            context,
            environment.Object,
            httpContextAccessor.Object
        );

        // Act
        var result = await service.GetMyReviewsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalReviews);
        Assert.Single(result.Reviews);

        var review = result.Reviews.First();

        Assert.Equal(1, review.ReviewId);
        Assert.Equal(1, review.UserId);
        Assert.Equal(5, review.Rating);
        Assert.Equal("Excellent place", review.Comment);

        Assert.Equal(1, result.Page);
        Assert.Equal(10, result.PageSize);
        Assert.Equal(1, result.TotalPages);
        Assert.False(result.HasMore);
    }

    [Fact]
    public async Task GetReviewsAsync_ShouldReturnReviewsForSpecificPlace()
    {
        // Arrange
        await using var context = TestDbContextFactory.Create();

        context.Categories.Add(
            new Category
            {
                CategoryId = 1,
                CategoryName = "Restaurant",
                Icon = "restaurant",
                ImageUrl = "restaurant.jpg"
            }
        );

        context.Users.AddRange(
            new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test1@example.com",
                MobileNumber = "9999999999",
                PasswordHash = "hashed",
                Role = "Reviewer"
            },
            new User
            {
                Id = 2,
                FullName = "Second User",
                Email = "test2@example.com",
                MobileNumber = "8888888888",
                PasswordHash = "hashed",
                Role = "Reviewer"
            }
        );

        context.Places.Add(
            new Place
            {
                PlaceId = 1,
                Name = "Test Restaurant",
                CategoryId = 1,
                Address = "Main Road",
                City = "Pune",
                Rating = 4.5,
                ReviewCount = 2,
                ImageUrl = "restaurant.jpg",
                OpenStatus = true
            }
        );

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                PlaceId = 1,
                Rating = 5,
                Comment = "Excellent food",
                CreatedAt = new DateTime(2026, 1, 1)
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 2,
                PlaceId = 1,
                Rating = 3,
                Comment = "Average food",
                CreatedAt = new DateTime(2026, 1, 2)
            },
            new ReviewItem
            {
                ReviewId = 3,
                UserId = 2,
                Rating = 1,
                Comment = "Different place",
                CreatedAt = new DateTime(2026, 1, 3)
            }
        );

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor
            .Setup(x => x.HttpContext)
            .Returns((HttpContext?)null);

        var service = new ReviewService(
            context,
            environment.Object,
            httpContextAccessor.Object
        );

        // Act
        var result = await service.GetReviewsAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalReviews);
        Assert.Equal(2, result.Reviews.Count());

        Assert.Equal(4, result.AverageRating);

        Assert.Equal(1, result.FiveStarCount);
        Assert.Equal(1, result.ThreeStarCount);
        Assert.Equal(0, result.FourStarCount);
        Assert.Equal(0, result.TwoStarCount);
        Assert.Equal(0, result.OneStarCount);

        Assert.All(result.Reviews, review =>
        {
            Assert.Equal(1, review.PlaceId);
            Assert.Equal("Test Restaurant", review.PlaceName);
        });
    }

    [Fact]
    public async Task GetReviewsAsync_ShouldFilterReviewsByRating()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Test User",
            Email = "test@example.com",
            MobileNumber = "9999999999",
            PasswordHash = "hashed",
            Role = "Reviewer"
        });

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        context.Places.Add(new Place
        {
            PlaceId = 1,
            Name = "Test Restaurant",
            CategoryId = 1,
            Address = "Main Road",
            City = "Pune"
        });

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                PlaceId = 1,
                Rating = 5,
                Comment = "Excellent"
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 1,
                PlaceId = 1,
                Rating = 3,
                Comment = "Average"
            },
            new ReviewItem
            {
                ReviewId = 3,
                UserId = 1,
                PlaceId = 1,
                Rating = 5,
                Comment = "Very good"
            }
        );

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var service = new ReviewService(
            context,
            environment.Object,
            httpContextAccessor.Object);

        var result = await service.GetReviewsAsync(1, rating: 5);

        Assert.NotNull(result);
        Assert.Equal(2, result.TotalReviews);
        Assert.Equal(2, result.Reviews.Count);
        Assert.All(result.Reviews, review => Assert.Equal(5, review.Rating));
    }

    [Fact]
    public async Task GetBusinessReviewsAsync_ShouldReturnBusinessReviewsWithBusinessDetails()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Business Reviewer",
            Email = "businessreviewer@example.com",
            MobileNumber = "9999999999",
            PasswordHash = "hashed",
            Role = "Reviewer"
        });

        context.Categories.Add(new Category
        {
            CategoryId = 1,
            CategoryName = "Restaurant"
        });

        context.Businesses.Add(new Business
        {
            BusinessId = 1,
            OwnerId = 1,
            CategoryId = 1,
            BusinessName = "Test Cafe",
            Address = "FC Road",
            City = "Pune",
            Pincode = "411004",
            Description = "Test business",
            PhoneNumber = "9876543210",
            Email = "cafe@example.com"
        });

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                BusinessId = 1,
                Rating = 5,
                Comment = "Excellent cafe"
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 1,
                BusinessId = 1,
                Rating = 3,
                Comment = "Average cafe"
            }
        );

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var service = new ReviewService(
            context,
            environment.Object,
            httpContextAccessor.Object);

        var result = await service.GetBusinessReviewsAsync(1);

        Assert.NotNull(result);
        Assert.Equal(2, result.TotalReviews);
        Assert.Equal(2, result.Reviews.Count);
        Assert.Equal(4, result.AverageRating);

        Assert.All(result.Reviews, review =>
        {
            Assert.Equal(1, review.BusinessId);
            Assert.Equal("Test Cafe", review.BusinessName);
            Assert.Equal("FC Road", review.BusinessAddress);
            Assert.Equal("Pune", review.BusinessCity);
            Assert.Equal("411004", review.BusinessPincode);
        });
    }

    [Fact]
    public async Task GetUserPublicProfileAsync_ShouldReturnRequestedUserReview()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.AddRange(
            new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test@example.com",
                MobileNumber = "9999999999",
                PasswordHash = "hashed",
                Role = "Reviewer"
            },
            new User
            {
                Id = 2,
                FullName = "Other User",
                Email = "other@example.com",
                MobileNumber = "8888888888",
                PasswordHash = "hashed",
                Role = "Reviewer"
            }
        );

        context.Reviews.AddRange(
            new ReviewItem
            {
                ReviewId = 1,
                UserId = 1,
                Rating = 5,
                Comment = "Excellent place"
            },
            new ReviewItem
            {
                ReviewId = 2,
                UserId = 2,
                Rating = 3,
                Comment = "Average place"
            }
        );

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var service = new ReviewService(
            context,
            environment.Object,
            httpContextAccessor.Object);

        var result = await service.GetUserPublicProfileAsync(1, 1);

        Assert.NotNull(result);
        Assert.Equal(1, result.Review.ReviewId);
        Assert.Equal(1, result.User.Id);
        Assert.Equal("Test User", result.User.FullName);
        Assert.Equal(5, result.Review.Rating);
        Assert.Equal("Excellent place", result.Review.Comment);
    }

    [Fact]
    public async Task DeleteReviewAsync_ShouldDeleteExistingReview()
    {
        await using var context = TestDbContextFactory.Create();

        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Test User",
            Email = "test@example.com",
            MobileNumber = "9999999999",
            PasswordHash = "hashed",
            Role = "Reviewer"
        });

        context.Reviews.Add(new ReviewItem
        {
            ReviewId = 1,
            UserId = 1,
            Rating = 5,
            Comment = "Review to delete"
        });

        await context.SaveChangesAsync();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.DeleteReviewAsync(1);

        Assert.True(result);

        var deletedReview = await context.Reviews.FindAsync(1);
        Assert.Null(deletedReview);
    }


    [Fact]
    public async Task DeleteReviewAsync_ShouldReturnFalse_WhenReviewDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.DeleteReviewAsync(999);

        Assert.False(result);
    }

    [Fact]
    public async Task GetReviewsAsync_ShouldNormalizeInvalidPageAndPageSize()
    {
        await using var context = TestDbContextFactory.Create();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        context.Users.Add(new User { Id = 1, FullName = "Test User", Email = "test@test.com", MobileNumber = "9999999999", PasswordHash = "hash", Role = "Reviewer" });
        context.Places.Add(new Place { PlaceId = 1, Name = "Test Place", CategoryId = 1 });
        context.Reviews.Add(new ReviewItem { ReviewId = 1, UserId = 1, PlaceId = 1, Rating = 5, Comment = "Excellent" });
        await context.SaveChangesAsync();

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.GetReviewsAsync(1, 0, 0);

        Assert.Equal(1, result.Page);
        Assert.Equal(10, result.PageSize);
        Assert.Equal(1, result.TotalReviews);
    }

    [Fact]
    public async Task GetUserPublicProfileAsync_ShouldReturnNull_WhenReviewDoesNotBelongToUser()
    {
        await using var context = TestDbContextFactory.Create();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        context.Users.Add(new User { Id = 1, FullName = "Test User", Email = "test@test.com", MobileNumber = "9999999999", PasswordHash = "hash", Role = "Reviewer" });
        context.Places.Add(new Place { PlaceId = 1, Name = "Test Place", CategoryId = 1 });
        context.Reviews.Add(new ReviewItem { ReviewId = 1, UserId = 1, PlaceId = 1, Rating = 5, Comment = "Excellent" });
        await context.SaveChangesAsync();

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.GetUserPublicProfileAsync(999, 1);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetBusinessReviewsAsync_ShouldFilterByRating()
    {
        await using var context = TestDbContextFactory.Create();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        context.Users.Add(new User { Id = 1, FullName = "Owner", Email = "owner@test.com", MobileNumber = "9999999999", PasswordHash = "hash", Role = "BusinessOwner" });
        context.Categories.Add(new Category { CategoryId = 1, CategoryName = "Food" });
        context.Businesses.Add(new Business { BusinessId = 1, OwnerId = 1, CategoryId = 1, BusinessName = "Test Business", Address = "Main Road", City = "Pune", Pincode = "411001" });
        context.Reviews.AddRange(
            new ReviewItem { ReviewId = 1, UserId = 1, BusinessId = 1, Rating = 5, Comment = "Excellent" },
            new ReviewItem { ReviewId = 2, UserId = 1, BusinessId = 1, Rating = 3, Comment = "Average" },
            new ReviewItem { ReviewId = 3, UserId = 1, BusinessId = 1, Rating = 5, Comment = "Very good" });
        await context.SaveChangesAsync();

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.GetBusinessReviewsAsync(1, 1, 10, 5);

        Assert.Equal(2, result.TotalReviews);
        Assert.Equal(2, result.Reviews.Count);
        Assert.All(result.Reviews, review => Assert.Equal(5, review.Rating));
        Assert.Equal(2, result.FiveStarCount);
    }

    [Fact]
    public async Task GetReviewsAsync_ShouldLimitPageSizeTo50()
    {
        await using var context = TestDbContextFactory.Create();

        var environment = new Mock<IWebHostEnvironment>();
        environment.Setup(x => x.WebRootPath).Returns(Path.GetTempPath());
        environment.Setup(x => x.ContentRootPath).Returns(Path.GetTempPath());

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        httpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext?)null);

        context.Users.Add(new User { Id = 1, FullName = "Test User", Email = "limit@test.com", MobileNumber = "8888888888", PasswordHash = "hash", Role = "Reviewer" });
        context.Places.Add(new Place { PlaceId = 1, Name = "Test Place", CategoryId = 1 });
        context.Reviews.Add(new ReviewItem { ReviewId = 1, UserId = 1, PlaceId = 1, Rating = 5, Comment = "Good" });
        await context.SaveChangesAsync();

        var service = new ReviewService(context, environment.Object, httpContextAccessor.Object);

        var result = await service.GetReviewsAsync(1, 1, 100);

        Assert.Equal(50, result.PageSize);
        Assert.Equal(1, result.TotalReviews);
    }
}
