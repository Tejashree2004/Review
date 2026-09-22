using Microsoft.EntityFrameworkCore;
using Review.API.Models;

namespace Review.API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(AppDbContext context)
        {
            Console.WriteLine("========================================");
            Console.WriteLine("===== REVIO SEED DATA STARTED =====");
            Console.WriteLine("========================================");

            // =====================================================
            // CATEGORIES
            // =====================================================

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category
                    {
                        CategoryName = "Restaurant",
                        Icon = "🍽",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Cafe",
                        Icon = "☕",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Hotel",
                        Icon = "🏨",
                        ImageUrl = ""
                    },
                    new Category
                    {
                        CategoryName = "Gym",
                        Icon = "🏋",
                        ImageUrl = ""
                    }
                );

                await context.SaveChangesAsync();

                Console.WriteLine("Categories Added");
            }

            // =====================================================
            // NOTIFICATIONS
            // =====================================================

            if (!context.Notifications.Any())
            {
                context.Notifications.AddRange(
                    new Notification
                    {
                        Title = "Welcome",
                        Message = "Welcome to REVIO.",
                        IsRead = false
                    },
                    new Notification
                    {
                        Title = "Top Rated",
                        Message = "Explore today's top rated places.",
                        IsRead = false
                    },
                    new Notification
                    {
                        Title = "AI Review",
                        Message = "AI Review Summary is now available.",
                        IsRead = false
                    }
                );

                await context.SaveChangesAsync();

                Console.WriteLine("Notifications Added");
            }

            // =====================================================
            // LARGE BUSINESS REVIEW TEST DATA
            // =====================================================

            await SeedLargeBusinessReviews(context);

            Console.WriteLine("========================================");
            Console.WriteLine("===== REVIO SEED DATA COMPLETED =====");
            Console.WriteLine("========================================");
        }

        // =========================================================
        // LARGE BUSINESS REVIEW SEED
        // =========================================================

        private static async Task SeedLargeBusinessReviews(
            AppDbContext context)
        {
            const int businessId = 6;
            const int targetReviewCount = 200;

            Console.WriteLine("");
            Console.WriteLine(
                $"===== LARGE REVIEW TEST DATA FOR BUSINESS {businessId} ====="
            );

            // =====================================================
            // CHECK BUSINESS
            // =====================================================

            var business =
                await context.Businesses
                    .FirstOrDefaultAsync(
                        x => x.BusinessId == businessId
                    );

            if (business == null)
            {
                Console.WriteLine(
                    $"Business ID {businessId} was not found."
                );

                Console.WriteLine(
                    "Large review test data was NOT inserted."
                );

                return;
            }

            Console.WriteLine(
                $"Business Found: {business.BusinessName}"
            );

            // =====================================================
            // LARGE REALISTIC REVIEW COMMENTS
            // =====================================================

            var comments = new[]
            {
                "I recently visited this bookstore and had a really pleasant experience. The collection was well organized and I was able to find several books that I had been looking for. The staff was polite, patient and helpful when I asked for recommendations. The overall environment was comfortable and peaceful, which made browsing enjoyable. I would definitely visit again.",

                "This was my first visit and I was pleasantly surprised by the variety of books available here. The shelves were arranged properly and the store was clean and comfortable. The staff members were friendly and helped me find the section I needed without making me wait for too long. Overall, I had a very satisfying experience and would recommend this place to other readers.",

                "I visited this bookstore with my family and spent quite a lot of time exploring different sections. The environment was calm and the staff was cooperative throughout our visit. I particularly liked the way the books were organized because it made searching much easier. There were many interesting options available for different age groups and interests. Overall, it was a good experience.",

                "The overall experience was very good. I liked the atmosphere of the store and the way the books were displayed. The staff was helpful whenever I had questions and they gave useful suggestions based on what I was looking for. The store was clean, properly maintained and easy to explore. A few more seating areas would make the experience even better, but I was happy with my visit.",

                "I had a decent experience during my visit. The bookstore was easy to locate and the overall environment was comfortable. I found several books that interested me and the staff was respectful while helping customers. The only thing that could be improved is the waiting time during busy hours. Apart from that, the collection and service were satisfactory and I would consider visiting again.",

                "I really enjoyed spending time here because the store had a peaceful atmosphere and a good selection of books. The staff was welcoming and did not hesitate to help me when I needed assistance. Everything looked clean and organized. I also appreciated that the employees allowed customers enough time to browse without constantly interrupting them. Overall, this was a comfortable and enjoyable bookstore experience.",

                "I came here after seeing positive feedback from other customers and wanted to check the place myself. The experience was good and the staff interacted politely with customers. I liked the organization of the different sections and the overall cleanliness of the store. Some titles were unavailable, but there were enough alternatives to choose from. I would happily visit again when I am looking for new books.",

                "The bookstore has a nice collection and the overall customer experience was positive. I was able to find books from multiple categories and the staff helped me locate a particular title. The environment was quiet enough to comfortably browse through the shelves. Billing was also handled smoothly. There are a few areas where the store could improve, but overall I had a good experience.",

                "This place offers a comfortable environment for anyone who enjoys reading. I spent nearly an hour checking different sections and found several interesting books. The staff was friendly and answered my questions patiently. The store appeared clean and well maintained during my visit. I especially liked the peaceful atmosphere because it allowed me to take my time before deciding what to purchase.",

                "My experience was quite positive overall. The collection included books from different genres and there were several options for both students and general readers. The staff was polite and helped me find what I needed. The store was organized properly and the customer service was satisfactory. With slightly better availability of some popular titles, the experience could become even better.",

                "I visited the bookstore on a weekend and expected it to be crowded, but the experience was still comfortable. The staff members were organized and helped customers efficiently. I liked the variety of books and the fact that different genres were clearly separated. The store was clean and the shelves were easy to navigate. Overall, I enjoyed the visit and found some useful books.",

                "I was looking for books related to personal development and found several interesting options. The staff suggested a few titles based on my interests and I found their recommendations useful. The atmosphere was calm and the store was nicely maintained. I spent more time than expected browsing through the shelves because there were many books that caught my attention. Overall, a very pleasant visit.",

                "The bookstore provides a good balance between variety and organization. I could easily find sections for fiction, education, children's books and general reading. The staff was courteous and answered my questions clearly. The billing process was smooth and I did not experience any major inconvenience. A slightly larger selection of newly released titles would be helpful, but overall the experience was positive.",

                "I visited this place with a friend and both of us enjoyed exploring the different sections. The store was peaceful and there was enough space to move around comfortably. The staff was helpful without being intrusive. I appreciated the cleanliness and organization of the shelves. We ended up purchasing a few books and were happy with the overall experience.",

                "The customer service here was better than I expected. The staff listened carefully to what I was looking for and guided me toward relevant sections. The bookstore was clean, bright and well organized. I also liked that the books were displayed in a way that made browsing easier. There were a few titles I could not find, but the available collection was still quite good.",

                "I had a very enjoyable reading and shopping experience here. The atmosphere was quiet and comfortable, which made it easy to spend time browsing. The staff was polite and helpful. I liked the variety of genres and the overall arrangement of the store. The place felt welcoming and suitable for both casual readers and people looking for specific books.",

                "This bookstore has a friendly atmosphere and a good collection. I visited specifically to find academic material and was able to find several useful books. The staff helped me compare different options and explained the differences clearly. The billing process was quick and simple. Overall, I was satisfied with the service and would visit again whenever I need books.",

                "The store was well maintained and the shelves were organized in a logical way. I did not need much assistance because it was easy to locate different categories, but when I asked a staff member for help they responded politely. The overall environment was peaceful. I liked the experience and would recommend the bookstore to readers in the area.",

                "I visited this bookstore in the evening and the environment was still comfortable. The staff was attentive and helped customers without creating unnecessary delays. I found several books that were on my reading list. The store was clean and the overall layout made it easy to browse. There is some room for improvement in availability, but the overall experience was good.",

                "Overall, I had a satisfying experience at this bookstore. The collection was diverse, the staff was courteous and the store was properly maintained. I particularly liked the calm atmosphere because it made browsing enjoyable. The prices were reasonable for the books I purchased and the billing process was smooth. I would definitely consider returning for future purchases."
            };

            // =====================================================
            // LOCAL IMAGE FILES ALREADY PRESENT IN PROJECT
            // =====================================================

            var imageUrls = new[]
            {
                "/uploads/reviews/2c7bedafeec04d7ba88c2bc24aed877d.jpg",
                "/uploads/reviews/69606839334b413dab542bc1d7d159ba.jpg",
                "/uploads/business/afd3847e158f40f2aff0b7db9db60427.jpg"
            };

            // =====================================================
            // VIDEO URLS
            //
            // These are public MP4 test videos.
            //
            // NOTE:
            // They are stored only in SeedData.
            // Existing ReviewService should not be changed here.
            // =====================================================

            var videoUrls = new[]
            {
                "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                "https://www.w3schools.com/html/mov_bbb.mp4"
            };

            // =====================================================
            // STEP 1
            // CREATE / LOAD TEST USERS
            // =====================================================

            var testUsers =
                new List<User>();

            for (
                int i = 1;
                i <= targetReviewCount;
                i++
            )
            {
                string email =
                    $"reviewer{i:D3}@test.revio.local";

                var user =
                    await context.Users
                        .FirstOrDefaultAsync(
                            x => x.Email == email
                        );

                if (user == null)
                {
                    user =
                        new User
                        {
                            FullName =
                                $"REVIO Reviewer {i:D3}",

                            Email =
                                email,

                            MobileNumber =
                                $"90000{i:D5}",

                            PasswordHash =
                                "TEST_REVIEWER_PASSWORD_HASH",

                            Role =
                                "Reviewer",

                            IsEmailVerified =
                                true,

                            CreatedAt =
                                DateTime.UtcNow
                                    .AddDays(-i)
                        };

                    context.Users.Add(user);

                    await context.SaveChangesAsync();

                    Console.WriteLine(
                        $"Created test user {i}/{targetReviewCount}"
                    );
                }

                testUsers.Add(user);
            }

            Console.WriteLine("");
            Console.WriteLine(
                $"Test users ready: {testUsers.Count}"
            );

            // =====================================================
            // STEP 2
            // LOAD EXISTING TEST REVIEWS
            // =====================================================

            var existingTestReviews =
                await context.Reviews
                    .Include(x => x.User)
                    .Include(x => x.Media)
                    .Where(
                        x =>
                            x.BusinessId == businessId &&
                            x.User != null &&
                            x.User.Email.EndsWith(
                                "@test.revio.local"
                            )
                    )
                    .ToListAsync();

            Console.WriteLine(
                $"Existing test reviews: {existingTestReviews.Count}"
            );

            // =====================================================
            // STEP 3
            // CREATE ONLY MISSING REVIEWS
            // =====================================================

            var reviewsToAdd =
                new List<ReviewItem>();

            for (
                int i = 0;
                i < testUsers.Count;
                i++
            )
            {
                var user =
                    testUsers[i];

                var alreadyExists =
                    existingTestReviews.Any(
                        x =>
                            x.UserId == user.Id &&
                            x.BusinessId == businessId
                    );

                if (alreadyExists)
                {
                    continue;
                }

                int reviewNumber =
                    i + 1;

                // Balanced 1-5 star distribution.
                int rating =
                    (i % 5) + 1;

                string comment =
                    comments[
                        i % comments.Length
                    ];

                comment +=
                    $" This is test review #{reviewNumber} created for checking the REVIO large review collection, pagination, long text layout, ratings, image galleries and video previews.";

                // Keep within the normal 500-character
                // application validation limit.
                if (comment.Length > 500)
                {
                    comment =
                        comment.Substring(
                            0,
                            497
                        ) + "...";
                }

                var review =
                    new ReviewItem
                    {
                        UserId =
                            user.Id,

                        Rating =
                            rating,

                        Comment =
                            comment,

                        BusinessId =
                            businessId,

                        PlaceId =
                            null,

                        CreatedAt =
                            DateTime.UtcNow
                                .AddDays(-reviewNumber)
                                .AddMinutes(
                                    reviewNumber
                                ),

                        OwnerReply =
                            null,

                        OwnerReplyAt =
                            null
                    };

                reviewsToAdd.Add(review);
            }

            if (reviewsToAdd.Count > 0)
            {
                context.Reviews.AddRange(
                    reviewsToAdd
                );

                await context.SaveChangesAsync();

                Console.WriteLine(
                    $"New test reviews inserted: {reviewsToAdd.Count}"
                );
            }
            else
            {
                Console.WriteLine(
                    "No new test reviews were required."
                );
            }

            // =====================================================
            // STEP 4
            // LOAD ALL TEST REVIEWS
            // =====================================================

            var allTestReviews =
                await context.Reviews
                    .Include(x => x.User)
                    .Include(x => x.Media)
                    .Where(
                        x =>
                            x.BusinessId == businessId &&
                            x.User != null &&
                            x.User.Email.EndsWith(
                                "@test.revio.local"
                            )
                    )
                    .OrderBy(
                        x => x.CreatedAt
                    )
                    .ToListAsync();

            Console.WriteLine(
                $"Total test reviews now: {allTestReviews.Count}"
            );

            // =====================================================
            // STEP 5
            // REMOVE OLD TEST MEDIA ONLY
            //
            // Existing real user's media is NOT touched.
            //
            // This allows us to regenerate the test media
            // distribution whenever the backend starts.
            // =====================================================

            var oldTestMedia =
                await context.ReviewMedias
                    .Where(
                        media =>
                            context.Reviews.Any(
                                review =>
                                    review.ReviewId ==
                                        media.ReviewId &&
                                    review.BusinessId ==
                                        businessId &&
                                    review.User != null &&
                                    review.User.Email.EndsWith(
                                        "@test.revio.local"
                                    )
                            )
                    )
                    .ToListAsync();

            if (oldTestMedia.Count > 0)
            {
                context.ReviewMedias.RemoveRange(
                    oldTestMedia
                );

                await context.SaveChangesAsync();

                Console.WriteLine(
                    $"Old test media removed: {oldTestMedia.Count}"
                );
            }

            // =====================================================
            // STEP 6
            // ADD LOTS OF IMAGES + VIDEOS
            //
            // Distribution:
            //
            // #15, #30, #45...
            //       3 images + 1 video
            //
            // #12, #24, #36...
            //       2 images + 1 video
            //
            // #10, #20, #40...
            //       1 image + 1 video
            //
            // #8, #16, #32...
            //       3 images
            //
            // #5, #25, #35...
            //       2 images
            //
            // Other even reviews
            //       1 image
            // =====================================================

            var mediaToAdd =
                new List<ReviewMedia>();

            for (
                int i = 0;
                i < allTestReviews.Count;
                i++
            )
            {
                var review =
                    allTestReviews[i];

                int reviewNumber =
                    i + 1;

                // =================================================
                // 3 IMAGES + VIDEO
                // =================================================

                if (reviewNumber % 15 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 1) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(1)
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 2) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(2)
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                videoUrls[
                                    i % videoUrls.Length
                                ],

                            MediaType =
                                "video",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(3)
                        }
                    );

                    continue;
                }

                // =================================================
                // 2 IMAGES + VIDEO
                // =================================================

                if (reviewNumber % 12 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 1) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(1)
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                videoUrls[
                                    i % videoUrls.Length
                                ],

                            MediaType =
                                "video",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(2)
                        }
                    );

                    continue;
                }

                // =================================================
                // 1 IMAGE + VIDEO
                // =================================================

                if (reviewNumber % 10 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                videoUrls[
                                    i % videoUrls.Length
                                ],

                            MediaType =
                                "video",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(1)
                        }
                    );

                    continue;
                }

                // =================================================
                // 3 IMAGES
                // =================================================

                if (reviewNumber % 8 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 1) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(1)
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 2) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(2)
                        }
                    );

                    continue;
                }

                // =================================================
                // 2 IMAGES
                // =================================================

                if (reviewNumber % 5 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );

                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    (i + 1) %
                                    imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                                    .AddSeconds(1)
                        }
                    );

                    continue;
                }

                // =================================================
                // 1 IMAGE FOR MOST EVEN REVIEWS
                // =================================================

                if (reviewNumber % 2 == 0)
                {
                    mediaToAdd.Add(
                        new ReviewMedia
                        {
                            ReviewId =
                                review.ReviewId,

                            MediaUrl =
                                imageUrls[
                                    i % imageUrls.Length
                                ],

                            MediaType =
                                "image",

                            CreatedAt =
                                review.CreatedAt
                        }
                    );
                }
            }

            // =====================================================
            // SAVE ALL TEST MEDIA
            // =====================================================

            if (mediaToAdd.Count > 0)
            {
                context.ReviewMedias.AddRange(
                    mediaToAdd
                );

                await context.SaveChangesAsync();

                Console.WriteLine(
                    $"Test review media inserted: {mediaToAdd.Count}"
                );
            }
            else
            {
                Console.WriteLine(
                    "No test media was inserted."
                );
            }

            // =====================================================
            // FINAL DATABASE CHECK
            // =====================================================

            var finalReviewCount =
                await context.Reviews
                    .CountAsync(
                        x =>
                            x.BusinessId ==
                            businessId
                    );

            var finalTestReviewCount =
                await context.Reviews
                    .Include(x => x.User)
                    .CountAsync(
                        x =>
                            x.BusinessId ==
                                businessId &&
                            x.User != null &&
                            x.User.Email.EndsWith(
                                "@test.revio.local"
                            )
                    );

            var finalMediaCount =
                await context.ReviewMedias
                    .CountAsync(
                        x =>
                            context.Reviews.Any(
                                review =>
                                    review.ReviewId ==
                                        x.ReviewId &&
                                    review.BusinessId ==
                                        businessId
                            )
                    );

            var finalImageCount =
                await context.ReviewMedias
                    .CountAsync(
                        x =>
                            x.MediaType == "image" &&
                            context.Reviews.Any(
                                review =>
                                    review.ReviewId ==
                                        x.ReviewId &&
                                    review.BusinessId ==
                                        businessId
                            )
                    );

            var finalVideoCount =
                await context.ReviewMedias
                    .CountAsync(
                        x =>
                            x.MediaType == "video" &&
                            context.Reviews.Any(
                                review =>
                                    review.ReviewId ==
                                        x.ReviewId &&
                                    review.BusinessId ==
                                        businessId
                            )
                    );

            Console.WriteLine("");
            Console.WriteLine("========================================");
            Console.WriteLine("===== FINAL REVIEW TEST DATA =====");
            Console.WriteLine(
                $"Business ID       : {businessId}"
            );
            Console.WriteLine(
                $"All reviews       : {finalReviewCount}"
            );
            Console.WriteLine(
                $"Test reviews      : {finalTestReviewCount}"
            );
            Console.WriteLine(
                $"Total media       : {finalMediaCount}"
            );
            Console.WriteLine(
                $"Images            : {finalImageCount}"
            );
            Console.WriteLine(
                $"Videos            : {finalVideoCount}"
            );
            Console.WriteLine("========================================");
            Console.WriteLine(
                "===== LARGE REVIEW TEST DATA DONE ====="
            );
            Console.WriteLine("========================================");
        }
    }
}