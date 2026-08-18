using Microsoft.EntityFrameworkCore;
using Review.API.Data;
using Review.API.DTOs;
using Review.API.Models;

namespace Review.API.Services;

public class BusinessService
{
    private readonly AppDbContext _context;

    public BusinessService(AppDbContext context)
    {
        _context = context;
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

            BusinessName =
                dto.BusinessName?.Trim() ?? string.Empty,

            Description =
                dto.Description?.Trim() ?? string.Empty,

            PhoneNumber =
                dto.PhoneNumber?.Trim() ?? string.Empty,

            Email =
                dto.Email?.Trim() ?? string.Empty,

            Address =
                dto.Address?.Trim() ?? string.Empty,

            City =
                dto.City?.Trim() ?? string.Empty,

            Pincode =
                dto.Pincode?.Trim() ?? string.Empty,

            Website =
                dto.Website?.Trim() ?? string.Empty,

            OpeningTime =
                dto.OpeningTime?.Trim() ?? string.Empty,

            ClosingTime =
                dto.ClosingTime?.Trim() ?? string.Empty,

            IsOpen = true,

            // =================================================
            // IMPORTANT
            //
            // Business should immediately appear in:
            // - Home
            // - Search
            // - Category
            //
            // Admin approval system is not currently being
            // used for this flow.
            // =================================================

            IsApproved = true,
            IsActive = true,

            Rating = 0,
            ReviewCount = 0,

            CreatedAt = DateTime.UtcNow
        };

        _context.Businesses.Add(business);

        await _context.SaveChangesAsync();

        // =====================================================
        // RETURN COMPLETE BUSINESS
        // =====================================================

        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstAsync(x =>
                x.BusinessId == business.BusinessId);
    }

    // =====================================================
    // GET BUSINESS BY ID
    // =====================================================

    public async Task<Business?> GetBusinessByIdAsync(
        int businessId)
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.IsActive &&
                x.IsApproved);
    }

    // =====================================================
    // GET ALL PUBLIC BUSINESSES
    // =====================================================

    public async Task<List<Business>> GetPublicBusinessesAsync()
    {
        return await _context.Businesses
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.IsActive &&
                x.IsApproved)
            .OrderByDescending(x => x.Rating)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // GET BUSINESSES BY CATEGORY
    // =====================================================

    public async Task<List<Business>>
        GetBusinessesByCategoryAsync(
            int categoryId)
    {
        return await _context.Businesses
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.CategoryId == categoryId &&
                x.IsActive &&
                x.IsApproved)
            .OrderByDescending(x => x.Rating)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // SEARCH BUSINESSES
    // =====================================================

    public async Task<List<Business>> SearchBusinessesAsync(
        string search)
    {
        // =================================================
        // EMPTY SEARCH
        // =================================================

        if (string.IsNullOrWhiteSpace(search))
        {
            return await GetPublicBusinessesAsync();
        }

        search = search.Trim();

        // =================================================
        // CASE-INSENSITIVE SEARCH
        // PostgreSQL / Npgsql
        // =================================================

        return await _context.Businesses
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.IsActive &&
                x.IsApproved &&
                (
                    EF.Functions.ILike(
                        x.BusinessName,
                        $"%{search}%"
                    )

                    ||

                    EF.Functions.ILike(
                        x.City,
                        $"%{search}%"
                    )

                    ||

                    EF.Functions.ILike(
                        x.Address,
                        $"%{search}%"
                    )

                    ||

                    (
                        x.Category != null &&
                        EF.Functions.ILike(
                            x.Category.CategoryName,
                            $"%{search}%"
                        )
                    )
                ))
            .OrderByDescending(x => x.Rating)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // UPDATE BUSINESS
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
            dto.OpeningTime?.Trim() ?? string.Empty;

        business.ClosingTime =
            dto.ClosingTime?.Trim() ?? string.Empty;

        business.IsOpen =
            dto.IsOpen;

        business.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // =================================================
        // RETURN UPDATED BUSINESS
        // =================================================

        return await _context.Businesses
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.IsActive);
    }

    // =====================================================
    // DELETE / DEACTIVATE BUSINESS
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
    // GET BUSINESS PHOTOS
    // =====================================================

    public async Task<List<BusinessPhoto>>
        GetBusinessPhotosAsync(
            int businessId)
    {
        return await _context.BusinessPhotos
            .AsNoTracking()
            .Where(x =>
                x.BusinessId == businessId)
            .OrderByDescending(x => x.IsPrimary)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    // =====================================================
    // ADD BUSINESS PHOTO
    // =====================================================

    public async Task<BusinessPhoto?> AddBusinessPhotoAsync(
        int businessId,
        int ownerId,
        BusinessPhotoDto dto)
    {
        var business = await _context.Businesses
            .FirstOrDefaultAsync(x =>
                x.BusinessId == businessId &&
                x.OwnerId == ownerId &&
                x.IsActive);

        if (business == null)
            return null;

        // =================================================
        // REMOVE OLD PRIMARY PHOTO
        // =================================================

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

        // =================================================
        // CREATE PHOTO
        // =================================================

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

        // =================================================
        // RETURN ONLY PHOTO
        //
        // Do NOT include Business navigation property here.
        // This prevents JSON object-cycle errors.
        // =================================================

        return businessPhoto;
    }

    // =====================================================
    // DELETE BUSINESS PHOTO
    // =====================================================

    public async Task<bool> DeleteBusinessPhotoAsync(
        int businessId,
        int businessPhotoId,
        int ownerId)
    {
        var photo = await _context.BusinessPhotos
            .Include(x => x.Business)
            .FirstOrDefaultAsync(x =>
                x.BusinessPhotoId == businessPhotoId &&
                x.BusinessId == businessId &&
                x.Business != null &&
                x.Business.OwnerId == ownerId &&
                x.Business.IsActive);

        if (photo == null)
            return false;

        var wasPrimary = photo.IsPrimary;

        _context.BusinessPhotos.Remove(photo);

        await _context.SaveChangesAsync();

        // =================================================
        // IF PRIMARY PHOTO WAS DELETED
        // MAKE LATEST PHOTO PRIMARY
        // =================================================

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
}