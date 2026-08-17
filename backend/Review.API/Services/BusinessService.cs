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
    // GET BUSINESS BY ID
    // =====================================================

    public async Task<Business?> GetBusinessByIdAsync(
        int businessId)
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(
                x => x.BusinessId == businessId &&
                     x.IsActive);
    }

    // =====================================================
    // GET ALL PUBLIC BUSINESSES
    // =====================================================

    public async Task<List<Business>> GetPublicBusinessesAsync()
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.IsActive &&
                x.IsApproved)
            .OrderByDescending(x => x.Rating)
            .ToListAsync();
    }

    // =====================================================
    // GET BUSINESSES BY CATEGORY
    // =====================================================

    public async Task<List<Business>> GetBusinessesByCategoryAsync(
        int categoryId)
    {
        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.CategoryId == categoryId &&
                x.IsActive &&
                x.IsApproved)
            .OrderByDescending(x => x.Rating)
            .ToListAsync();
    }

    // =====================================================
    // SEARCH BUSINESSES
    // =====================================================

    public async Task<List<Business>> SearchBusinessesAsync(
        string search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return await GetPublicBusinessesAsync();
        }

        search = search.Trim();

        return await _context.Businesses
            .Include(x => x.Category)
            .Include(x => x.Photos)
            .Where(x =>
                x.IsActive &&
                x.IsApproved &&
                (
                    x.BusinessName.Contains(search) ||
                    x.City.Contains(search) ||
                    x.Address.Contains(search) ||
                    (x.Category != null &&
                     x.Category.CategoryName.Contains(search))
                ))
            .OrderByDescending(x => x.Rating)
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
    // DELETE / DEACTIVATE BUSINESS
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
    // GET BUSINESS PHOTOS
    // =====================================================

    public async Task<List<BusinessPhoto>> GetBusinessPhotosAsync(
        int businessId)
    {
        return await _context.BusinessPhotos
            .Where(x => x.BusinessId == businessId)
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

        _context.BusinessPhotos.Remove(photo);

        await _context.SaveChangesAsync();

        return true;
    }
}