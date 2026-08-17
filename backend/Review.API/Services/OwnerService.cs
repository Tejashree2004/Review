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
            .Where(x => x.OwnerId == ownerId)
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
                x.OwnerId == ownerId);
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

            BusinessName = dto.BusinessName,
            Description = dto.Description,

            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,

            Address = dto.Address,
            City = dto.City,
            Pincode = dto.Pincode,

            Website = dto.Website,

            OpeningTime = dto.OpeningTime,
            ClosingTime = dto.ClosingTime,

            IsOpen = true,
            IsApproved = false,
            IsActive = true,

            Rating = 0,
            ReviewCount = 0,

            CreatedAt = DateTime.UtcNow
        };

        _context.Businesses.Add(business);

        await _context.SaveChangesAsync();

        return business;
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
                x.OwnerId == ownerId);

        if (business == null)
            return null;

        business.BusinessName = dto.BusinessName;
        business.Description = dto.Description;

        business.CategoryId = dto.CategoryId;

        business.PhoneNumber = dto.PhoneNumber;
        business.Email = dto.Email;

        business.Address = dto.Address;
        business.City = dto.City;
        business.Pincode = dto.Pincode;

        business.Website = dto.Website;

        business.OpeningTime = dto.OpeningTime;
        business.ClosingTime = dto.ClosingTime;

        business.IsOpen = dto.IsOpen;

        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return business;
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
                x.OwnerId == ownerId);

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
                x.Business.OwnerId == ownerId)
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

        var businessPhoto = new BusinessPhoto
        {
            BusinessId = businessId,
            PhotoUrl = dto.PhotoUrl,
            Caption = dto.Caption,
            IsPrimary = dto.IsPrimary,
            CreatedAt = DateTime.UtcNow
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
                x.Business.OwnerId == ownerId);

        if (photo == null)
            return false;

        _context.BusinessPhotos.Remove(photo);

        await _context.SaveChangesAsync();

        return true;
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
                x.OwnerId == ownerId);

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
                x.BusinessName == review.Place!.Name);

        if (business == null)
            return null;

        // Owner reply storage will be implemented
        // after adding the reply field to ReviewItem.

        return null;
    }
}