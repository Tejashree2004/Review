using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Models;
using Review.API.Services;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class ReviewControllerTests
{
    private static ReviewController CreateController(
        AppDbContext context,
        string? environmentName = null)
    {
        var environment = new MockWebHostEnvironment
        {
            WebRootPath = Path.Combine(
                Path.GetTempPath(),
                "ReviewControllerTests",
                Guid.NewGuid().ToString())
        };

        Directory.CreateDirectory(environment.WebRootPath);

        var httpContextAccessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext()
        };

        var service = new ReviewService(
            context,
            environment,
            httpContextAccessor);

        return new ReviewController(service);
    }

    [Fact]
    public async Task GetBusinessReviews_InvalidBusinessId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetBusinessReviews(0);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetBusinessReviews_InvalidRating_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetBusinessReviews(
            1,
            page: 1,
            pageSize: 10,
            rating: 6);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetBusinessReviews_ValidRequest_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetBusinessReviews(
            1,
            page: 1,
            pageSize: 10);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetBusinessReviews_InvalidPagination_IsNormalizedAndReturnsOk()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetBusinessReviews(
            1,
            page: 0,
            pageSize: 0);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetPlaceReviews_InvalidPlaceId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetPlaceReviews(0);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetPlaceReviews_InvalidRating_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetPlaceReviews(
            1,
            page: 1,
            pageSize: 10,
            rating: 0);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetPlaceReviews_ValidRequest_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetPlaceReviews(
            1,
            page: 1,
            pageSize: 10);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetMyReviews_InvalidUserId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetMyReviews(0);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetMyReviews_ValidRequest_ReturnsOk()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetMyReviews(
            1,
            page: 1,
            pageSize: 10);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetPublicProfile_InvalidUserId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetUserPublicProfile(
            0,
            1);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetPublicProfile_InvalidReviewId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetUserPublicProfile(
            1,
            0);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task GetPublicProfile_ReviewNotFound_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.GetUserPublicProfile(
            1,
            999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task AddReview_InvalidUserId_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 0,
            Rating = 5,
            Comment = "Good place"
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_InvalidRating_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 1,
            Rating = 6,
            Comment = "Good place"
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_WithoutPlaceOrBusiness_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 1,
            Rating = 5,
            Comment = "Good place"
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_EmptyComment_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "   "
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_CommentTooLong_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = new string('A', 501)
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_ValidRequest_CreatesReviewAndReturnsOk()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new ReviewDto
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Excellent service",
            Media = null
        };

        var result = await controller.AddReview(dto);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);
        Assert.NotNull(ok.Value);

        var review = context.Reviews.Single();

        Assert.Equal(1, review.UserId);
        Assert.Equal(1, review.BusinessId);
        Assert.Equal(5, review.Rating);
        Assert.Equal("Excellent service", review.Comment);
    }

    [Fact]
    public async Task AddReview_MoreThanFiveMediaFiles_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var files = Enumerable.Range(1, 6)
            .Select(_ =>
                (IFormFile)new FormFile(
                    new MemoryStream(new byte[] { 1, 2, 3 }),
                    0,
                    3,
                    "file",
                    "photo.jpg"))
            .ToList();

        var dto = new ReviewDto
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Good",
            Media = files
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task AddReview_UnsupportedMediaFormat_ReturnsBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var file = new FormFile(
            new MemoryStream(new byte[] { 1, 2, 3 }),
            0,
            3,
            "file",
            "document.pdf");

        var dto = new ReviewDto
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Good",
            Media = new List<IFormFile> { file }
        };

        var result = await controller.AddReview(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);

        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task DeleteReview_ReviewNotFound_ReturnsNotFound()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var result = await controller.DeleteReview(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFound.StatusCode);
    }

    [Fact]
    public async Task DeleteReview_ExistingReview_ReturnsOkAndRemovesReview()
    {
        using var context = TestDbContextFactory.Create();

        var review = new ReviewItem
        {
            UserId = 1,
            BusinessId = 1,
            Rating = 5,
            Comment = "Delete this review",
            CreatedAt = DateTime.UtcNow
        };

        context.Reviews.Add(review);
        await context.SaveChangesAsync();

        var reviewId = review.ReviewId;

        var controller = CreateController(context);

        var result = await controller.DeleteReview(reviewId);

        var ok = Assert.IsType<OkObjectResult>(result);

        Assert.Equal(200, ok.StatusCode);

        var deletedReview = await context.Reviews.FindAsync(reviewId);

        Assert.Null(deletedReview);
    }

    private sealed class MockWebHostEnvironment : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Test";

        public string ApplicationName { get; set; } = "Review.API.Tests";

        public string WebRootPath { get; set; } = string.Empty;

        public Microsoft.Extensions.FileProviders.IFileProvider WebRootFileProvider
        {
            get;
            set;
        } = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            Path.GetTempPath());

        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;

        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider
        {
            get;
            set;
        } = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            AppContext.BaseDirectory);
    }
}
