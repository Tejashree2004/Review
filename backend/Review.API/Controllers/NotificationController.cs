using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.Models;

namespace Review.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================
        // Get All Notifications
        // GET: api/notification
        // ==========================

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await _context.Notifications
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // ==========================
        // Mark As Read
        // PUT: api/notification/read/1
        // ==========================

        [HttpPut("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound("Notification not found.");

            notification.IsRead = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Notification marked as read."
            });
        }

        // ==========================
        // Delete Notification
        // DELETE: api/notification/1
        // ==========================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound("Notification not found.");

            _context.Notifications.Remove(notification);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Notification deleted successfully."
            });
        }
    }
}