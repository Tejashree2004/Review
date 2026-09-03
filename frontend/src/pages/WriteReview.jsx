
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaStar,
  FaPaperPlane,
  FaImages,
  FaTimes,
  FaVideo,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import { addReview } from "../services/ReviewService";

import DialogBox from "../components/DialogBox";

import "../styles/WriteReview.css";

function WriteReview() {
  const { placeId, businessId } = useParams();

  const navigate = useNavigate();

  const [rating, setRating] = useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [media, setMedia] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // DIALOG STATE
  // ==========================================

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: null,
  });

  // ==========================================
  // SHOW DIALOG
  // ==========================================

  const showDialog = (
    title,
    message,
    type = "info",
    action = null
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      action,
    });
  };

  // ==========================================
  // CLOSE DIALOG
  // ==========================================

  const closeDialog = () => {
    const action = dialog.action;

    setDialog((previous) => ({
      ...previous,
      isOpen: false,
      action: null,
    }));

    if (action) {
      action();
    }
  };

  // ==========================================
  // DETERMINE REVIEW TYPE
  // ==========================================

  const isBusinessReview =
    Boolean(businessId);

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = () => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("UserId");

    return userId
      ? Number(userId)
      : null;
  };

  // ==========================================
  // MEDIA VALIDATION
  // ==========================================

  const validateMedia = (file) => {
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const videoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];

    const isImage =
      imageTypes.includes(file.type);

    const isVideo =
      videoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return "Only JPG, JPEG, PNG, WEBP, MP4, MOV or WEBM files are allowed.";
    }

    const maxSize =
      isImage
        ? 5 * 1024 * 1024
        : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      return isImage
        ? "Each image must be 5 MB or smaller."
        : "Each video must be 50 MB or smaller.";
    }

    return null;
  };

  // ==========================================
  // HANDLE MEDIA SELECT
  // ==========================================

  const handleMediaChange = (e) => {
    const selectedFiles =
      Array.from(
        e.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const availableSlots =
      5 - media.length;

    if (availableSlots <= 0) {
      showDialog(
        "Media Limit",
        "You can upload a maximum of 5 photos or videos.",
        "warning"
      );

      e.target.value = "";
      return;
    }

    const filesToAdd =
      selectedFiles.slice(
        0,
        availableSlots
      );

    const validFiles = [];

    for (const file of filesToAdd) {
      const error =
        validateMedia(file);

      if (error) {
        showDialog(
          "Invalid Media",
          `${file.name}: ${error}`,
          "warning"
        );

        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setMedia((previous) => [
        ...previous,
        ...validFiles,
      ]);
    }

    e.target.value = "";
  };

  // ==========================================
  // REMOVE MEDIA
  // ==========================================

  const removeMedia = (index) => {
    setMedia((previous) =>
      previous.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  };

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getUserId();

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!userId) {
      showDialog(
        "Login Required",
        "Please login first to write a review.",
        "warning",
        () => navigate("/login")
      );

      return;
    }

    // ==========================================
    // RATING CHECK
    // ==========================================

    if (rating === 0) {
      showDialog(
        "Rating Required",
        "Please select a rating.",
        "warning"
      );

      return;
    }

    // ==========================================
    // COMMENT CHECK
    // ==========================================

    if (!comment.trim()) {
      showDialog(
        "Review Required",
        "Please write your review.",
        "warning"
      );

      return;
    }

    // ==========================================
    // ID CHECK
    // ==========================================

    if (!placeId && !businessId) {
      showDialog(
        "Unable to Submit",
        "Unable to identify the place or business.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // REVIEW DATA
      // ==========================================

      const reviewData = {
        userId: userId,

        rating: rating,

        comment: comment.trim(),

        ...(placeId && {
          placeId: Number(placeId),
        }),

        ...(businessId && {
          businessId: Number(businessId),
        }),

        media: media,
      };

      console.log(
        "=========================================="
      );

      console.log(
        "SUBMITTING REVIEW"
      );

      console.log(
        "=========================================="
      );

      console.log(
        "User ID:",
        reviewData.userId
      );

      console.log(
        "Rating:",
        reviewData.rating
      );

      console.log(
        "Comment:",
        reviewData.comment
      );

      console.log(
        "Place ID:",
        reviewData.placeId
      );

      console.log(
        "Business ID:",
        reviewData.businessId
      );

      console.log(
        "Media Count:",
        reviewData.media?.length || 0
      );

      if (
        reviewData.media &&
        reviewData.media.length > 0
      ) {
        reviewData.media.forEach(
          (file, index) => {
            console.log(
              `Media ${index + 1}:`,
              {
                name: file.name,
                type: file.type,
                size: file.size,
                sizeMB: (
                  file.size /
                  (1024 * 1024)
                ).toFixed(2),
              }
            );
          }
        );
      }

      console.log(
        "Full Review Data:",
        reviewData
      );

      console.log(
        "=========================================="
      );

      // ==========================================
      // SAVE REVIEW + MEDIA
      // ==========================================

      await addReview(
        reviewData
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      showDialog(
        "Review Added",
        "Review added successfully!",
        "success",
        () => {
          if (isBusinessReview) {
            navigate(
              `/business/${businessId}`
            );
          } else {
            navigate(
              `/place/${placeId}`
            );
          }
        }
      );
    } catch (error) {
      // ==========================================
      // DETAILED ERROR DEBUGGING
      // ==========================================

      console.error(
        "=========================================="
      );

      console.error(
        "REVIEW SUBMISSION FAILED"
      );

      console.error(
        "=========================================="
      );

      console.error(
        "Axios Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Status Text:",
        error.response?.statusText
      );

      console.error(
        "Server Response:",
        error.response?.data
      );

      console.error(
        "Server Message:",
        error.response?.data?.message
      );

      console.error(
        "Server Error:",
        error.response?.data?.error
      );

      console.error(
        "Validation Errors:",
        error.response?.data?.errors
      );

      console.error(
        "Response Headers:",
        error.response?.headers
      );

      console.error(
        "Request URL:",
        error.config?.url
      );

      console.error(
        "Request Method:",
        error.config?.method
      );

      console.error(
        "Request Content-Type:",
        error.config?.headers?.["Content-Type"]
      );

      console.error(
        "=========================================="
      );

      // ==========================================
      // PREPARE USER MESSAGE
      // ==========================================

      const responseData =
        error.response?.data;

      let errorMessage =
        "Failed to add review. Please try again.";

      if (
        responseData?.message
      ) {
        errorMessage =
          responseData.message;
      } else if (
        responseData?.error
      ) {
        errorMessage =
          responseData.error;
      } else if (
        responseData?.errors
      ) {
        const validationErrors =
          responseData.errors;

        if (
          typeof validationErrors ===
          "object"
        ) {
          const messages = Object.values(
            validationErrors
          )
            .flat()
            .filter(Boolean);

          if (
            messages.length > 0
          ) {
            errorMessage =
              messages.join("\n");
          }
        }
      }

      showDialog(
        "Review Failed",
        errorMessage,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>

      {/* Back Button */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <FaArrowLeft />
      </button>

      {/* Write Review Card */}

      <div className="write-review-page">

        <div className="write-review-card">

          <h1>
            Write a Review
          </h1>

          <p className="review-subtitle">
            Share your experience with this{" "}
            {isBusinessReview
              ? "business"
              : "place"}
          </p>

          {/* Rating */}

          <div className="rating-section">

            <h3>
              Your Rating
            </h3>

            <div className="star-container">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-button"
                    onMouseEnter={() =>
                      setHoverRating(star)
                    }
                    onMouseLeave={() =>
                      setHoverRating(0)
                    }
                    onClick={() =>
                      setRating(star)
                    }
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <FaStar
                      className={
                        star <=
                        (
                          hoverRating ||
                          rating
                        )
                          ? "star-active"
                          : "star-inactive"
                      }
                    />
                  </button>
                )
              )}

            </div>

            <span className="rating-text">
              {rating === 0
                ? "Select your rating"
                : `${rating} out of 5`}
            </span>

          </div>

          {/* Comment */}

          <form onSubmit={handleSubmit}>

            <div className="comment-section">

              <label htmlFor="comment">
                Your Review
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Tell others about your experience..."
                maxLength={500}
                rows={7}
              />

              <div className="character-count">
                {comment.length}/500
              </div>

            </div>

            {/* ===================================== */}
            {/* MEDIA UPLOAD */}
            {/* ===================================== */}

            <div className="review-media-section">

              <div className="review-media-header">

                <div>
                  <label>
                    Photos & Videos
                  </label>

                  <p>
                    Add photos or videos to your review
                  </p>
                </div>

                <span className="media-count">
                  {media.length}/5
                </span>

              </div>

              <label
                htmlFor="review-media"
                className={
                  media.length >= 5
                    ? "media-upload-btn disabled"
                    : "media-upload-btn"
                }
              >
                <FaImages />

                <span>
                  Add Photos & Videos
                </span>
              </label>

              <input
                id="review-media"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                multiple
                onChange={handleMediaChange}
                disabled={
                  media.length >= 5
                }
                hidden
              />

              <p className="media-help-text">
                Up to 5 files • Images max 5 MB • Videos max 50 MB
              </p>

              {/* ================================= */}
              {/* MEDIA PREVIEW */}
              {/* ================================= */}

              {media.length > 0 && (
                <div className="review-media-preview">

                  {media.map(
                    (file, index) => {

                      const previewUrl =
                        URL.createObjectURL(
                          file
                        );

                      const isVideo =
                        file.type.startsWith(
                          "video/"
                        );

                      return (
                        <div
                          className="review-media-item"
                          key={`${file.name}-${index}`}
                        >

                          {isVideo ? (
                            <div className="video-preview-wrapper">

                              <video
                                src={previewUrl}
                                className="review-media-preview-content"
                                controls
                              />

                              <span className="video-label">
                                <FaVideo />
                                Video
                              </span>

                            </div>
                          ) : (
                            <img
                              src={previewUrl}
                              alt={`Review media ${index + 1}`}
                              className="review-media-preview-content"
                            />
                          )}

                          <button
                            type="button"
                            className="remove-media-btn"
                            onClick={() =>
                              removeMedia(
                                index
                              )
                            }
                            title="Remove media"
                          >
                            <FaTimes />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* Submit */}

            <button
              type="submit"
              className="submit-review-btn"
              disabled={loading}
            >
              <FaPaperPlane />

              <span>
                {loading
                  ? "Submitting..."
                  : "Submit Review"}
              </span>

            </button>

          </form>

        </div>

      </div>

      {/* DIALOG */}

      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={closeDialog}
        onCancel={closeDialog}
      />

    </MainLayout>
  );
}

export default WriteReview;

