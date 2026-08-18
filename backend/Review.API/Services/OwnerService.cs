using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Models;

namespace Review.API.Services;

public class OwnerService
{
    private readonly AppDbContext _context;

    public OwnerService(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET OWNER BUSINESSES
    // =====================================================

    public async Task<List<Business>> GetOwnerBusinessesAsync(
        int ownerId)
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.OwnerId == ownerId &&
                x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // GET OWNER BUSINESS
    // =====================================================

    public async Task<Business?> GetOwnerBusinessAsync(
        int businessId,
        int ownerId)
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);
    }

    // =====================================================
    // CREATE BUSINESS
    // =====================================================

    public async Task<Business> CreateBusinessAsync(
        int ownerId,
        CreateBusinessDto dto)
    {
        var business = new Business
        {
            OwnerId = ownerId,
            CategoryId = dto.CategoryId,

            BusinessName = dto.BusinessName.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,

            PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
            Email = dto.Email?.Trim() ?? string.Empty,

            Address = dto.Address?.Trim() ?? string.Empty,
            City = dto.City?.Trim() ?? string.Empty,
            Pincode = dto.Pincode?.Trim() ?? string.Empty,

            Website = dto.Website?.Trim() ?? string.Empty,

            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,

            IsOpen = true,
            IsApproved = true,
            IsActive = true,

            Rating = 0,
            ReviewCount = 0,

            CreatedAt = DateTime.UtcNow
        };

        _context.Businesses.Add(business);

        await _context.SaveChangesAsync();

        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstAsync(x =>
                x.BusinessId == business.BusinessId);
    }

    // =====================================================
    // UPDATE OWNER BUSINESS
    // =====================================================

    public async Task<Business?> UpdateBusinessAsync(
        int businessId,
        int ownerId,
        UpdateBusinessDto dto)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);

        if (business == null)
            return null;

        business.BusinessName =
            dto.BusinessName?.Trim() ?? string.Empty;

        business.Description =
            dto.Description?.Trim() ?? string.Empty;

        business.CategoryId =
            dto.CategoryId;

        business.PhoneNumber =
            dto.PhoneNumber?.Trim() ?? string.Empty;

        business.Email =
            dto.Email?.Trim() ?? string.Empty;

        business.Address =
            dto.Address?.Trim() ?? string.Empty;

        business.City =
            dto.City?.Trim() ?? string.Empty;

        business.Pincode =
            dto.Pincode?.Trim() ?? string.Empty;

        business.Website =
            dto.Website?.Trim() ?? string.Empty;

        business.OpeningTime =
            dto.OpeningTime;

        business.ClosingTime =
            dto.ClosingTime;

        business.IsOpen =
            dto.IsOpen;

        business.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId);
    }

    // =====================================================
    // DELETE OWNER BUSINESS
    // =====================================================

    public async Task<bool> DeleteBusinessAsync(
        int businessId,
        int ownerId)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);

        if (business == null)
            return false;

        business.IsActive = false;
        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    // =====================================================
    // GET OWNER PHOTOS
    // =====================================================

    public async Task<List<BusinessPhoto>> GetOwnerPhotosAsync(
        int businessId,
        int ownerId)
    {
        return await _context.BusinessPhotos
            .Include(x => x.Business)
            .Where(x =>
                x.BusinessId == businessId &&
                x.Business != null &&
                x.Business.OwnerId == ownerId &&
                x.Business.IsActive)
            .OrderByDescending(x => x.IsPrimary)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // ADD OWNER PHOTO
    // =====================================================

    public async Task<BusinessPhoto?> AddOwnerPhotoAsync(
        int businessId,
        int ownerId,
        OwnerPhotoDto dto)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);

        if (business == null)
            return null;

        // -------------------------------------------------
        // IF NEW PHOTO IS PRIMARY/COVER
        // REMOVE PRIMARY FROM OLD PHOTO
        // -------------------------------------------------

        if (dto.IsPrimary)
        {
            var existingPrimaryPhotos =
                await _context.BusinessPhotos
                    .Where(x =>
                        x.BusinessId == businessId &&
                        x.IsPrimary)
                    .ToListAsync();

            foreach (var photo in existingPrimaryPhotos)
            {
                photo.IsPrimary = false;
            }
        }

        // -------------------------------------------------
        // CREATE PHOTO
        // -------------------------------------------------

        var businessPhoto = new BusinessPhoto
        {
            BusinessId = businessId,

            PhotoUrl =
                dto.PhotoUrl?.Trim() ?? string.Empty,

            Caption =
                dto.Caption?.Trim() ?? string.Empty,

            IsPrimary =
                dto.IsPrimary,

            CreatedAt =
                DateTime.UtcNow
        };

        _context.BusinessPhotos.Add(businessPhoto);

        await _context.SaveChangesAsync();

        return businessPhoto;
    }

    // =====================================================
    // DELETE OWNER PHOTO
    // =====================================================

    public async Task<bool> DeleteOwnerPhotoAsync(
        int businessPhotoId,
        int ownerId)
    {
        var photo = await _context.BusinessPhotos
            .Include(x => x.Business)
            .FirstOrDefaultAsync(x =>
                x.BusinessPhotoId == businessPhotoId &&
                x.Business != null &&
                x.Business.OwnerId == ownerId &&
                x.Business.IsActive);

        if (photo == null)
            return false;

        var wasPrimary = photo.IsPrimary;

        var businessId = photo.BusinessId;

        _context.BusinessPhotos.Remove(photo);

        await _context.SaveChangesAsync();

        // -------------------------------------------------
        // IF PRIMARY PHOTO WAS DELETED
        // MAKE ANOTHER PHOTO PRIMARY
        // -------------------------------------------------

        if (wasPrimary)
        {
            var nextPhoto =
                await _context.BusinessPhotos
                    .Where(x =>
                        x.BusinessId == businessId)
                    .OrderByDescending(x => x.CreatedAt)
                    .FirstOrDefaultAsync();

            if (nextPhoto != null)
            {
                nextPhoto.IsPrimary = true;

                await _context.SaveChangesAsync();
            }
        }

        return true;
    }

    // =====================================================
    // SET PRIMARY / COVER PHOTO
    // =====================================================

    public async Task<BusinessPhoto?> SetPrimaryPhotoAsync(
        int businessPhotoId,
        int ownerId)
    {
        var photo = await _context.BusinessPhotos
            .Include(x => x.Business)
            .FirstOrDefaultAsync(x =>
                x.BusinessPhotoId == businessPhotoId &&
                x.Business != null &&
                x.Business.OwnerId == ownerId &&
                x.Business.IsActive);

        if (photo == null)
            return null;

        var businessId = photo.BusinessId;

        var businessPhotos =
            await _context.BusinessPhotos
                .Where(x =>
                    x.BusinessId == businessId)
                .ToListAsync();

        foreach (var businessPhoto in businessPhotos)
        {
            businessPhoto.IsPrimary =
                businessPhoto.BusinessPhotoId ==
                businessPhotoId;
        }

        await _context.SaveChangesAsync();

        return photo;
    }

    // =====================================================
    // GET OWNER REVIEWS
    // =====================================================

    public async Task<List<ReviewItem>> GetOwnerReviewsAsync(
        int businessId,
        int ownerId)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);

        if (business == null)
        {
            return new List<ReviewItem>();
        }

        return await _context.Reviews
            .Include(x => x.User)
            .Include(x => x.Place)
            .Where(x =>
                x.Place != null &&
                x.Place.Name == business.BusinessName)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // REPLY TO REVIEW
    // =====================================================

    public async Task<ReviewItem?> ReplyToReviewAsync(
        int reviewId,
        int ownerId,
        OwnerReplyDto dto)
    {
        var review = await _context.Reviews
            .Include(x => x.Place)
            .FirstOrDefaultAsync(x =>
                x.ReviewId == reviewId &&
                x.Place != null);

        if (review == null)
            return null;

        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.OwnerId == ownerId &&
                x.BusinessName == review.Place!.Name &&
                x.IsActive);

        if (business == null)
            return null;

        // -------------------------------------------------
        // OWNER REPLY
        // -------------------------------------------------
        //
        // NOTE:
        // Your current ReviewItem model/service does not
        // show an OwnerReply field.
        //
        // So actual reply storage should be added only
        // after the Review model contains a reply property.
        //
        // -------------------------------------------------

        return null;
    }
}