import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCamera,
  FaCloudUploadAlt,
  FaTrash,
  FaStar,
  FaCheck,
  FaImage,
  FaSpinner,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import "../styles/OwnerPhotos.css";

const API_BASE = "http://localhost:5213/api";

function OwnerPhotos() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // =====================================================
  // STATES
  // =====================================================

  const [business, setBusiness] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // GET API DATA
  // =====================================================

  const getResponseData = (response) => {
    return (
      response?.data?.data ??
      response?.data?.Data ??
      response?.data
    );
  };

  // =====================================================
  // GET PHOTO ID
  // =====================================================

  const getPhotoId = (photo) => {
    return (
      photo?.businessPhotoId ??
      photo?.BusinessPhotoId ??
      photo?.id ??
      null
    );
  };

  // =====================================================
  // GET PHOTO URL
  // =====================================================

  const getPhotoUrl = (photo) => {
    return (
      photo?.photoUrl ??
      photo?.PhotoUrl ??
      photo?.image ??
      ""
    );
  };

  // =====================================================
  // GET BUSINESS ID
  // =====================================================

  const getBusinessId = (businessData) => {
    return (
      businessData?.businessId ??
      businessData?.BusinessId ??
      null
    );
  };

  // =====================================================
  // LOAD BUSINESS + PHOTOS
  // =====================================================

  useEffect(() => {
    loadBusinessAndPhotos();
  }, []);

  const loadBusinessAndPhotos = async () => {
    const token = getToken();

    if (!token) {
      alert("Your login session has expired. Please login again.");
      navigate("/login");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      setLoading(true);

      // =================================================
      // GET OWNER BUSINESS
      // GET /api/owner/business
      // =================================================

      const businessResponse = await axios.get(
        `${API_BASE}/owner/business`,
        config
      );

      const businessData = getResponseData(
        businessResponse
      );

      const ownerBusiness = Array.isArray(businessData)
        ? businessData[0]
        : businessData;

      if (!ownerBusiness) {
        setBusiness(null);
        setBusinessId(null);
        setPhotos([]);

        alert(
          "Please add your business information before uploading photos."
        );

        navigate("/owner/business");

        return;
      }

      setBusiness(ownerBusiness);

      const id = getBusinessId(ownerBusiness);

      if (!id) {
        console.error(
          "Business ID not found:",
          ownerBusiness
        );

        alert(
          "Business ID was not found. Please save your business information again."
        );

        return;
      }

      setBusinessId(id);

      // =================================================
      // GET BUSINESS PHOTOS
      //
      // GET:
      // /api/owner/photos/business/{businessId}
      // =================================================

      const photoResponse = await axios.get(
        `${API_BASE}/owner/photos/business/${id}`,
        config
      );

      const photoData = getResponseData(
        photoResponse
      );

      const backendPhotos = Array.isArray(photoData)
        ? photoData
        : [];

      setPhotos(backendPhotos);
    } catch (error) {
      console.error(
        "Business/photos loading error:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");

        return;
      }

      if (error.response?.status === 404) {
        alert(
          "Business or photo endpoint was not found. Please check the backend routes."
        );

        return;
      }

      alert(
        "Unable to load business photos."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPRESS IMAGE
  // =====================================================

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(
          new Error("Selected file is not an image.")
        );

        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();

        image.onload = () => {
          try {
            const maxWidth = 900;
            const maxHeight = 900;

            let width = image.width;
            let height = image.height;

            // ---------------------------------------------
            // KEEP ASPECT RATIO
            // ---------------------------------------------

            if (width > maxWidth) {
              height =
                (height * maxWidth) / width;

              width = maxWidth;
            }

            if (height > maxHeight) {
              width =
                (width * maxHeight) / height;

              height = maxHeight;
            }

            const canvas =
              document.createElement("canvas");

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            const context =
              canvas.getContext("2d");

            context.drawImage(
              image,
              0,
              0,
              canvas.width,
              canvas.height
            );

            // ------------------------------------------------
            // JPEG COMPRESSED DATA
            // ------------------------------------------------

            const compressed =
              canvas.toDataURL(
                "image/jpeg",
                0.55
              );

            resolve(compressed);
          } catch (error) {
            reject(error);
          }
        };

        image.onerror = () => {
          reject(
            new Error(
              "Unable to read selected image."
            )
          );
        };

        image.src = event.target.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read selected file."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // =====================================================
  // UPLOAD ONE PHOTO TO BACKEND
  // =====================================================

  const uploadPhoto = async (
    imageData,
    fileName,
    isPrimary
  ) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found."
      );
    }

    if (!businessId) {
      throw new Error(
        "Business ID not found."
      );
    }

    // ===================================================
    // IMPORTANT
    //
    // Backend expects:
    //
    // OwnerPhotoDto
    //
    // PhotoUrl
    // Caption
    // IsPrimary
    // ===================================================

    const payload = {
      PhotoUrl: imageData,
      Caption: fileName || "Business photo",
      IsPrimary: Boolean(isPrimary),
    };

    const response = await axios.post(
      `${API_BASE}/owner/photos/business/${businessId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return getResponseData(response);
  };

  // =====================================================
  // PROCESS FILES
  // =====================================================

  const processFiles = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp"
    );

    if (imageFiles.length === 0) {
      alert(
        "Please select JPG, PNG or WEBP image files only."
      );

      return;
    }

    // =================================================
    // MAX 12 PHOTOS
    // =================================================

    if (
      photos.length + imageFiles.length >
      12
    ) {
      alert(
        `You can upload maximum 12 business photos. You currently have ${photos.length} photos.`
      );

      return;
    }

    // =================================================
    // FILE SIZE CHECK
    // =================================================

    const oversizedFile = imageFiles.find(
      (file) =>
        file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      alert(
        "Each image must be smaller than 5 MB."
      );

      return;
    }

    try {
      setUploading(true);

      const uploadedPhotos = [];

      for (let index = 0; index < imageFiles.length; index++) {
        const file = imageFiles[index];

        // ===============================================
        // COMPRESS IMAGE
        // ===============================================

        const imageData =
          await compressImage(file);

        // ===============================================
        // FIRST PHOTO BECOMES PRIMARY
        // ONLY IF THERE IS NO EXISTING PRIMARY PHOTO
        // ===============================================

        const hasPrimaryPhoto =
          photos.some(
            (photo) =>
              photo?.isPrimary === true ||
              photo?.IsPrimary === true
          );

        const isPrimary =
          !hasPrimaryPhoto &&
          uploadedPhotos.length === 0;

        // ===============================================
        // UPLOAD TO BACKEND
        // ===============================================

        const savedPhoto =
          await uploadPhoto(
            imageData,
            file.name,
            isPrimary
          );

        // ===============================================
        // ADD TO UI
        // ===============================================

        if (savedPhoto) {
          uploadedPhotos.push(
            savedPhoto
          );
        }
      }

      // =================================================
      // REFRESH PHOTOS FROM BACKEND
      // =================================================

      await loadBusinessPhotosOnly();

      alert(
        uploadedPhotos.length === 1
          ? "Photo uploaded successfully!"
          : `${uploadedPhotos.length} photos uploaded successfully!`
      );
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      // =================================================
      // 400 ERROR
      // =================================================

      if (
        error.response?.status === 400
      ) {
        const backendMessage =
          error.response?.data?.message ??
          error.response?.data?.Message ??
          "";

        console.error(
          "Backend 400 response:",
          error.response?.data
        );

        if (backendMessage) {
          alert(
            backendMessage
          );
        } else {
          alert(
            "Invalid photo data. The backend rejected the image."
          );
        }

        return;
      }

      // =================================================
      // 401
      // =================================================

      if (
        error.response?.status === 401
      ) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");

        return;
      }

      // =================================================
      // 404
      // =================================================

      if (
        error.response?.status === 404
      ) {
        alert(
          "Photo upload endpoint was not found. Please check the backend route."
        );

        return;
      }

      // =================================================
      // OTHER
      // =================================================

      alert(
        error.message ||
          "Something went wrong while uploading the photo."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // LOAD PHOTOS ONLY
  // =====================================================

  const loadBusinessPhotosOnly = async () => {
    const token = getToken();

    if (!token || !businessId) {
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE}/owner/photos/business/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        getResponseData(response);

      setPhotos(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to refresh photos:",
        error
      );
    }
  };

  // =====================================================
  // FILE INPUT
  // =====================================================

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      processFiles(files);
    }

    event.target.value = "";
  };

  // =====================================================
  // DRAG ENTER
  // =====================================================

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  // =====================================================
  // DRAG OVER
  // =====================================================

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  // =====================================================
  // DRAG LEAVE
  // =====================================================

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  // =====================================================
  // DROP
  // =====================================================

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const files =
      event.dataTransfer.files;

    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  // =====================================================
  // DELETE PHOTO
  // =====================================================

  const handleDelete = async (photo) => {
    const photoId =
      getPhotoId(photo);

    if (!photoId) {
      alert(
        "Photo ID not found."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this photo?"
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }

    try {
      setUploading(true);

      await axios.delete(
        `${API_BASE}/owner/photos/${photoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =================================================
      // REFRESH
      // =================================================

      await loadBusinessPhotosOnly();

      alert(
        "Photo deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete photo error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        alert(
          "Your login session has expired."
        );

        navigate("/login");

        return;
      }

      if (
        error.response?.status === 404
      ) {
        alert(
          "Photo not found or you are not the owner."
        );

        return;
      }

      alert(
        "Unable to delete photo."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // SET PRIMARY PHOTO
  // =====================================================

  const handleSetPrimary = async (
    selectedPhoto
  ) => {
    const selectedPhotoId =
      getPhotoId(selectedPhoto);

    if (!selectedPhotoId) {
      alert(
        "Photo ID not found."
      );

      return;
    }

    const token = getToken();

    if (!token || !businessId) {
      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }

    try {
      setUploading(true);

      // =================================================
      // BACKEND DOES NOT HAVE UPDATE PHOTO ENDPOINT.
      //
      // Therefore:
      // 1. Delete old primary status is not directly
      //    supported by current controller.
      //
      // 2. We use POST again only if backend supports
      //    creating the photo with IsPrimary.
      //
      // To avoid duplicate photo, this function gives
      // a clear message instead of silently duplicating.
      // =================================================

      alert(
        "Primary photo is selected automatically when the first photo is uploaded. To change the primary photo, the backend needs a SetPrimaryPhoto endpoint."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const openFilePicker = () => {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="owner-photos-page">

          <div
            style={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <FaSpinner
              className="fa-spin"
              size={28}
            />

            <p>
              Loading business photos...
            </p>
          </div>

        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <MainLayout>
      <div className="owner-photos-page">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="owner-photos-topbar">

          <button
            type="button"
            className="owner-photos-back"
            onClick={() =>
              navigate("/owner-dashboard")
            }
            aria-label="Back"
          >
            <FaArrowLeft />
          </button>

          <div className="owner-photos-brand">
            REVIO
          </div>

          <div className="owner-photos-count">
            {photos.length}/12
          </div>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="owner-photos-header">

          <div className="owner-photos-label">
            BUSINESS PROFILE
          </div>

          <h1>
            Business Photos
          </h1>

          <p>
            Add high-quality photos to show
            customers what your business looks like.
          </p>

          {business && (
            <p
              style={{
                marginTop: "8px",
                fontWeight: "600",
              }}
            >
              {business?.businessName ??
                business?.BusinessName}
            </p>
          )}

        </section>


        {/* =================================================
            UPLOAD AREA
        ================================================= */}

        <section
          className={`photo-upload-box ${
            isDragging
              ? "photo-upload-dragging"
              : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          <div className="upload-icon">
            {uploading ? (
              <FaSpinner className="fa-spin" />
            ) : (
              <FaCloudUploadAlt />
            )}
          </div>

          <h2>
            {uploading
              ? "Uploading photos..."
              : "Add business photos"}
          </h2>

          <p>
            Drag and drop your photos here
            or choose them from your device.
          </p>

          <button
            type="button"
            className="choose-photo-btn"
            onClick={openFilePicker}
            disabled={uploading}
          >
            <FaCamera />

            {uploading
              ? "Uploading..."
              : "Choose Photos"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            hidden
          />

          <div className="upload-info">
            JPG, PNG or WEBP • Maximum 12 photos • Maximum 5 MB per image
          </div>

        </section>


        {/* =================================================
            PHOTO GRID
        ================================================= */}

        {photos.length > 0 ? (

          <section className="photos-section">

            <div className="photos-section-header">

              <div>

                <h2>
                  Your Photos
                </h2>

                <p>
                  These photos are stored in
                  your business profile.
                </p>

              </div>

              <div className="photos-number">

                <FaImage />

                {photos.length}

              </div>

            </div>


            <div className="photos-grid">

              {photos.map(
                (photo, index) => {

                  const photoUrl =
                    getPhotoUrl(photo);

                  const photoId =
                    getPhotoId(photo);

                  const isPrimary =
                    photo?.isPrimary === true ||
                    photo?.IsPrimary === true;

                  const caption =
                    photo?.caption ??
                    photo?.Caption ??
                    `Business Photo ${index + 1}`;

                  return (

                    <div
                      className={`photo-card ${
                        isPrimary
                          ? "photo-card-cover"
                          : ""
                      }`}
                      key={
                        photoId ??
                        `${photoUrl}-${index}`
                      }
                    >

                      {/* IMAGE */}

                      <div className="photo-image-wrapper">

                        {photoUrl ? (

                          <img
                            src={photoUrl}
                            alt={caption}
                            className="business-photo"
                          />

                        ) : (

                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FaImage
                              size={40}
                            />
                          </div>

                        )}


                        {/* PRIMARY BADGE */}

                        {isPrimary && (

                          <div className="cover-badge">

                            <FaStar />

                            Cover Photo

                          </div>

                        )}


                        {/* ACTIONS */}

                        <div className="photo-actions">

                          {!isPrimary && (

                            <button
                              type="button"
                              className="photo-action-btn"
                              title="Set as primary"
                              onClick={() =>
                                handleSetPrimary(
                                  photo
                                )
                              }
                              disabled={uploading}
                            >
                              <FaStar />
                            </button>

                          )}

                          <button
                            type="button"
                            className="photo-action-btn delete-photo-btn"
                            title="Delete photo"
                            onClick={() =>
                              handleDelete(
                                photo
                              )
                            }
                            disabled={uploading}
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </div>


                      {/* PHOTO FOOTER */}

                      <div className="photo-card-footer">

                        <span
                          className="photo-name"
                          title={caption}
                        >
                          {caption}
                        </span>

                        {isPrimary && (

                          <span className="cover-check">

                            <FaCheck />

                          </span>

                        )}

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          </section>

        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <section className="photos-empty">

            <div className="empty-photo-icon">
              <FaImage />
            </div>

            <h2>
              No photos yet
            </h2>

            <p>
              Add photos of your hotel,
              restaurant, salon, shop or business.
            </p>

            <button
              type="button"
              className="empty-upload-btn"
              onClick={openFilePicker}
              disabled={uploading}
            >
              <FaCamera />

              Add Your First Photo

            </button>

          </section>

        )}


        {/* =================================================
            TIPS
        ================================================= */}

        <section className="photo-tips">

          <div className="tips-icon">
            <FaCheck />
          </div>

          <div>

            <h3>
              Make your profile stand out
            </h3>

            <p>
              Add a cover photo, exterior view,
              interior, menu, rooms, services
              and other important areas of your business.
            </p>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="owner-photos-footer">
          REVIO • Discover. Review. Trust.
        </div>

      </div>
    </MainLayout>
  );
}

export default OwnerPhotos;