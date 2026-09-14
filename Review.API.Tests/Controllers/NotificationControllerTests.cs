using Microsoft.AspNetCore.Mvc;
using Review.API.Controllers;
using Review.API.Models;
using Review.API.Tests.Helpers;

namespace Review.API.Tests.Controllers;

public class NotificationControllerTests
{
    [Fact]
    public async Task GetNotifications_ShouldReturnOkWithNotificationsOrderedByNewest()
    {
        await using var context = TestDbContextFactory.Create();

        context.Notifications.AddRange(
            new Notification
            {
                NotificationId = 1,
                Message = "Older notification",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                IsRead = false
            },
            new Notification
            {
                NotificationId = 2,
                Message = "Newer notification",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });

        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.GetNotifications();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var notifications =
            Assert.IsAssignableFrom<IEnumerable<Notification>>(okResult.Value);

        var list = notifications.ToList();

        Assert.Equal(2, list.Count);
        Assert.Equal(2, list[0].NotificationId);
        Assert.Equal(1, list[1].NotificationId);
    }

    [Fact]
    public async Task GetNotifications_ShouldReturnEmptyList_WhenNoNotificationsExist()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new NotificationController(context);

        var result = await controller.GetNotifications();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var notifications =
            Assert.IsAssignableFrom<IEnumerable<Notification>>(okResult.Value);

        Assert.Empty(notifications);
    }

    [Fact]
    public async Task MarkAsRead_ShouldReturnNotFound_WhenNotificationDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new NotificationController(context);

        var result = await controller.MarkAsRead(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal("Notification not found.", notFound.Value);
    }

    [Fact]
    public async Task MarkAsRead_ShouldMarkNotificationAsRead()
    {
        await using var context = TestDbContextFactory.Create();

        context.Notifications.Add(
            new Notification
            {
                NotificationId = 1,
                Message = "New review received",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });

        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.MarkAsRead(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var notification = await context.Notifications.FindAsync(1);

        Assert.NotNull(notification);
        Assert.True(notification!.IsRead);

        var type = okResult.Value.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Notification marked as read.",
            type.GetProperty("Message")!.GetValue(okResult.Value));
    }

    [Fact]
    public async Task DeleteNotification_ShouldReturnNotFound_WhenNotificationDoesNotExist()
    {
        await using var context = TestDbContextFactory.Create();

        var controller = new NotificationController(context);

        var result = await controller.DeleteNotification(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal("Notification not found.", notFound.Value);
    }

    [Fact]
    public async Task DeleteNotification_ShouldDeleteNotification()
    {
        await using var context = TestDbContextFactory.Create();

        context.Notifications.Add(
            new Notification
            {
                NotificationId = 1,
                Message = "Notification to delete",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            });

        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.DeleteNotification(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        var notification = await context.Notifications.FindAsync(1);

        Assert.Null(notification);

        var type = okResult.Value.GetType();

        Assert.Equal(true, type.GetProperty("Success")!.GetValue(okResult.Value));
        Assert.Equal(
            "Notification deleted successfully.",
            type.GetProperty("Message")!.GetValue(okResult.Value));
    }
}
