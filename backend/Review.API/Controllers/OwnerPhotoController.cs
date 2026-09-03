using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Review.API.DTOs;
using Review.API.Services;
using System.Security.Claims;

namespace Review.API.Controllers;

[ApiController]
[Route("api/owner/photos")]
[Authorize]
public class OwnerPhotoController : ControllerBase
{
    private readonly OwnerService _ownerService;
    private readonly IWebHostEnvironment _environment;

    private const long MaxFileSize = 5 * 1024 * 1024;

    private static readonly string[] AllowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    public OwnerPhotoController(
        OwnerService ownerService,
        IWebHostEnvironment environment)
    {
        _ownerService = ownerService;
        _environment = environment;
    }

    // =====================================================
    // GET:
    // api/owner/photos/business/{businessId}
    // Get owner business photos
    // =====================================================

    [HttpGet("business/{businessId:int}")]
    public async Task<IActionResult> GetPhotos(int businessId)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        var photos =
            await _ownerService.GetOwnerPhotosAsync(
                businessId,
                ownerId
            );

        return Ok(new
        {
            Success = true,
            Message = "Business photos fetched successfully.",
            Data = photos
        });
    }

    // =====================================================
    // POST:
    // api/owner/photos/business/{businessId}
    //
    // Upload business photo
    // =====================================================

    [HttpPost("business/{businessId:int}")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> AddPhoto(
        int businessId,
        [FromForm] OwnerPhotoDto dto)
    {
        // =================================================
        // VALIDATE PHOTO
        // =================================================

        if (dto.Photo == null || dto.Photo.Length == 0)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Please select a photo."
            });
        }

        // =================================================
        // MAX FILE SIZE
        // =================================================

        if (dto.Photo.Length > MaxFileSize)
        {
            return BadRequest(new
            {
                Success = false,
                Message = "Photo size must not exceed 5 MB."
            });
        }

        // =================================================
        // GET FILE EXTENSION
        // =================================================

        var extension =
            Path.GetExtension(dto.Photo.FileName)
                .ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new
            {
                Success = false,
                Message =
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            });
        }

        // =================================================
        // GET OWNER ID FROM JWT
        // =================================================

        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        // =================================================
        // CHECK BUSINESS OWNERSHIP BEFORE SAVING FILE
        // =================================================

        var ownerPhotos =
            await _ownerService.GetOwnerPhotosAsync(
                businessId,
                ownerId
            );

        var businessExists =
            await _ownerService.OwnerBusinessExistsAsync(
                businessId,
                ownerId
            );

        if (!businessExists)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Business not found or you are not the owner."
            });
        }

        // =================================================
        // CREATE UPLOAD DIRECTORY
        //
        // wwwroot/uploads/business
        // =================================================

        var uploadsFolder =
            Path.Combine(
                _environment.WebRootPath ?? "wwwroot",
                "uploads",
                "business"
            );

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // =================================================
        // CREATE UNIQUE FILE NAME
        // =================================================

        var fileName =
            $"{Guid.NewGuid():N}{extension}";

        var physicalFilePath =
            Path.Combine(
                uploadsFolder,
                fileName
            );

        // =================================================
        // URL SAVED IN DATABASE
        // =================================================

        var photoUrl =
            $"/uploads/business/{fileName}";

        try
        {
            // =============================================
            // SAVE ACTUAL IMAGE FILE
            // =============================================

            await using (var stream =
                new FileStream(
                    physicalFilePath,
                    FileMode.CreateNew))
            {
                await dto.Photo.CopyToAsync(stream);
            }

            // =============================================
            // SAVE PHOTO INFORMATION IN DATABASE
            // =============================================

            var photo =
                await _ownerService.AddOwnerPhotoAsync(
                    businessId,
                    ownerId,
                    dto,
                    photoUrl
                );

            if (photo == null)
            {
                // =========================================
                // DELETE FILE IF DATABASE OPERATION
                // CANNOT CONTINUE
                // =========================================

                if (System.IO.File.Exists(physicalFilePath))
                {
                    System.IO.File.Delete(
                        physicalFilePath);
                }

                return NotFound(new
                {
                    Success = false,
                    Message =
                        "Business not found or you are not the owner."
                });
            }

            return Ok(new
            {
                Success = true,
                Message =
                    "Business photo added successfully.",
                Data = photo
            });
        }
        catch (Exception)
        {
            // =============================================
            // CLEANUP FILE IF ANY ERROR OCCURS
            // =============================================

            if (System.IO.File.Exists(physicalFilePath))
            {
                try
                {
                    System.IO.File.Delete(
                        physicalFilePath);
                }
                catch
                {
                    // Ignore cleanup failure.
                }
            }

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    Success = false,
                    Message =
                        "An error occurred while uploading the photo."
                });
        }
    }

    // =====================================================
    // DELETE:
    // api/owner/photos/{photoId}
    // =====================================================

    [HttpDelete("{photoId:int}")]
    public async Task<IActionResult> DeletePhoto(int photoId)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        // =================================================
        // GET PHOTO BEFORE DELETE
        //
        // We need PhotoUrl so that physical file can
        // also be removed.
        // =================================================

        var photo =
            await _ownerService.GetOwnerPhotoByIdAsync(
                photoId,
                ownerId
            );

        if (photo == null)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Photo not found or you are not the owner."
            });
        }

        var deleted =
            await _ownerService.DeleteOwnerPhotoAsync(
                photoId,
                ownerId
            );

        if (!deleted)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Photo not found or you are not the owner."
            });
        }

        // =================================================
        // DELETE PHYSICAL FILE
        // =================================================

        DeletePhysicalFile(photo.PhotoUrl);

        return Ok(new
        {
            Success = true,
            Message =
                "Business photo deleted successfully."
        });
    }

    // =====================================================
    // PUT:
    // api/owner/photos/{photoId}/primary
    //
    // Set photo as primary / cover photo
    // =====================================================

    [HttpPut("{photoId:int}/primary")]
    public async Task<IActionResult> SetPrimaryPhoto(
        int photoId)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!int.TryParse(userIdClaim, out var ownerId))
        {
            return Unauthorized(new
            {
                Success = false,
                Message = "Invalid user token."
            });
        }

        var photo =
            await _ownerService.SetPrimaryPhotoAsync(
                photoId,
                ownerId
            );

        if (photo == null)
        {
            return NotFound(new
            {
                Success = false,
                Message =
                    "Photo not found or you are not the owner."
            });
        }

        return Ok(new
        {
            Success = true,
            Message =
                "Primary photo updated successfully.",
            Data = photo
        });
    }

    // =====================================================
    // DELETE PHYSICAL FILE HELPER
    // =====================================================

    private void DeletePhysicalFile(string? photoUrl)
    {
        if (string.IsNullOrWhiteSpace(photoUrl))
            return;

        // -------------------------------------------------
        // Only delete our own uploaded files.
        // Do not try to delete external URLs or Base64.
        // -------------------------------------------------

        if (!photoUrl.StartsWith(
                "/uploads/business/",
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var relativePath =
            photoUrl.TrimStart('/')
                .Replace(
                    '/',
                    Path.DirectorySeparatorChar);

        var webRoot =
            _environment.WebRootPath ?? "wwwroot";

        var physicalPath =
            Path.Combine(
                webRoot,
                relativePath
            );

        if (System.IO.File.Exists(physicalPath))
        {
            try
            {
                System.IO.File.Delete(
                    physicalPath);
            }
            catch
            {
                // Ignore physical file cleanup errors.
            }
        }
    }
}