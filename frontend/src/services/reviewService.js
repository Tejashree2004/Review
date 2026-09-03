
import axios from "axios";

// ===================================
// BASE API
// ===================================

const API_BASE = "http://localhost:5213/api";

// ===================================
// GET BUSINESS REVIEWS
// ===================================

export const getBusinessReviews = (
  businessId,
  page = 1,
  pageSize = 10,
  rating = null
) => {
  return axios.get(
    `${API_BASE}/Review/business/${businessId}`,
    {
      params: {
        page,
        pageSize,
        ...(rating
          ? { rating }
          : {}),
      },
    }
  );
};

// ===================================
// GET PLACE REVIEWS
// ===================================

export const getPlaceReviews = (
  placeId,
  page = 1,
  pageSize = 10,
  rating = null
) => {
  return axios.get(
    `${API_BASE}/Review/place/${placeId}`,
    {
      params: {
        page,
        pageSize,
        ...(rating
          ? { rating }
          : {}),
      },
    }
  );
};

// ===================================
// GET USER PUBLIC PROFILE REVIEW
// ===================================

export const getUserPublicProfile = (
  userId,
  reviewId
) => {
  return axios.get(
    `${API_BASE}/Review/user/${userId}/review/${reviewId}`
  );
};

// ===================================
// GET USER REVIEWS
// ===================================

export const getUserReviews = (
  userId,
  page = 1,
  pageSize = 10
) => {
  return axios.get(
    `${API_BASE}/Review/my/${userId}`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );
};

// ===================================
// ADD REVIEW
// ===================================

export const addReview = (
  reviewData
) => {
  // ===================================
  // CREATE FORMDATA
  // ===================================

  const formData = new FormData();

  // ===================================
  // USER ID
  // ===================================

  formData.append(
    "UserId",
    String(reviewData.userId)
  );

  // ===================================
  // RATING
  // ===================================

  formData.append(
    "Rating",
    String(reviewData.rating)
  );

  // ===================================
  // COMMENT
  // ===================================

  formData.append(
    "Comment",
    reviewData.comment || ""
  );

  // ===================================
  // PLACE ID
  // ===================================

  if (
    reviewData.placeId !== undefined &&
    reviewData.placeId !== null
  ) {
    formData.append(
      "PlaceId",
      String(reviewData.placeId)
    );
  }

  // ===================================
  // BUSINESS ID
  // ===================================

  if (
    reviewData.businessId !== undefined &&
    reviewData.businessId !== null
  ) {
    formData.append(
      "BusinessId",
      String(reviewData.businessId)
    );
  }

  // ===================================
  // MEDIA FILES
  // ===================================

  if (
    Array.isArray(reviewData.media) &&
    reviewData.media.length > 0
  ) {
    reviewData.media.forEach((file) => {
      if (file instanceof File) {
        formData.append(
          "Media",
          file,
          file.name
        );
      }
    });
  }

  // ===================================
  // DEBUG FORMDATA
  // ===================================

  console.log(
    "=========================================="
  );

  console.log(
    "REVIEW FORMDATA"
  );

  console.log(
    "=========================================="
  );

  for (
    const [key, value]
    of formData.entries()
  ) {
    if (value instanceof File) {
      console.log(
        key,
        {
          name: value.name,
          type: value.type,
          size: value.size,
        }
      );
    } else {
      console.log(
        key,
        value
      );
    }
  }

  console.log(
    "=========================================="
  );

  // ===================================
  // SEND MULTIPART REQUEST
  // ===================================

  return axios.post(
    `${API_BASE}/Review`,
    formData,
    {
      headers: {
        Accept: "application/json",

        // Do NOT manually set multipart/form-data.
        // The browser must generate the boundary.
        "Content-Type": undefined,
      },

      // ===================================
      // IMPORTANT FIX
      // ===================================
      //
      // If a global Axios default/interceptor
      // adds:
      //
      // Content-Type: application/json
      //
      // this transform removes it immediately
      // before Axios sends the request.
      //
      // This allows FormData to be sent as:
      //
      // multipart/form-data; boundary=...
      //
      // ===================================

      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
            delete headers["content-type"];
          }

          return data;
        },
      ],
    }
  );
};

// ===================================
// DELETE REVIEW
// ===================================

export const deleteReview = (
  reviewId
) => {
  return axios.delete(
    `${API_BASE}/Review/${reviewId}`
  );
};

