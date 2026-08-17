using Microsoft.EntityFrameworkCore;
using Review.API.Models;

namespace Review.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // =====================================================
    // TABLES
    // =====================================================

    public DbSet<User> Users => Set<User>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Place> Places => Set<Place>();

    public DbSet<ReviewItem> Reviews => Set<ReviewItem>();

    public DbSet<Favorite> Favorites => Set<Favorite>();

    public DbSet<Notification> Notifications => Set<Notification>();

    // =====================================================
    // BUSINESS TABLES
    // =====================================================

    public DbSet<Business> Businesses => Set<Business>();

    public DbSet<BusinessPhoto> BusinessPhotos => Set<BusinessPhoto>();

    // =====================================================
    // MODEL CONFIGURATION
    // =====================================================

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =================================================
        // USER
        // =================================================

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(x => x.MobileNumber)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(x => x.Role)
            .HasMaxLength(20)
            .HasDefaultValue("Reviewer");

        // =================================================
        // CATEGORY → PLACE
        // =================================================

        modelBuilder.Entity<Place>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // =================================================
        // CATEGORY → BUSINESS
        // =================================================

        modelBuilder.Entity<Business>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // =================================================
        // BUSINESS → OWNER
        // =================================================

        modelBuilder.Entity<Business>()
            .HasOne(x => x.Owner)
            .WithMany()
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // BUSINESS → PHOTOS
        // =================================================

        modelBuilder.Entity<BusinessPhoto>()
            .HasOne(x => x.Business)
            .WithMany(x => x.Photos)
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // REVIEW → USER
        // =================================================

        modelBuilder.Entity<ReviewItem>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // REVIEW → PLACE
        // =================================================

        modelBuilder.Entity<ReviewItem>()
            .HasOne(x => x.Place)
            .WithMany()
            .HasForeignKey(x => x.PlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // REVIEW → BUSINESS
        // =================================================

        modelBuilder.Entity<ReviewItem>()
            .HasOne(x => x.Business)
            .WithMany()
            .HasForeignKey(x => x.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // FAVORITE → USER
        // =================================================

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // FAVORITE → PLACE
        // =================================================

        modelBuilder.Entity<Favorite>()
            .HasOne(x => x.Place)
            .WithMany()
            .HasForeignKey(x => x.PlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        // =================================================
        // PREVENT DUPLICATE FAVORITES
        // =================================================

        modelBuilder.Entity<Favorite>()
            .HasIndex(x => new
            {
                x.UserId,
                x.PlaceId
            })
            .IsUnique();
    }
}