import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaCloudUploadAlt,
  FaTrash,
  FaStar,
  FaCheck,
  FaImage,
} from "react-icons/fa";

import MainLayout from "../layouts/MainLayout";
import "../styles/OwnerPhotos.css";

function OwnerPhotos() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const userId =
    localStorage.getItem("userId") || "guest-owner";

  const storageKey = `ownerBusinessPhotos_${userId}`;

  const [photos, setPhotos] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =====================================================
  // LOAD SAVED PHOTOS
  // =====================================================

  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem(storageKey);

      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error("Failed to load photos:", error);
    }
  }, [storageKey]);

  // =====================================================
  // SAVE PHOTOS
  // =====================================================

  const savePhotos = (updatedPhotos) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updatedPhotos)
      );

      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Failed to save photos:", error);

      alert(
        "Storage is full. Please delete some photos and try again."
      );
    }
  };

  // =====================================================
  // COMPRESS IMAGE
  // =====================================================

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;

          let width = img.width;
          let height = img.height;

          // Keep original aspect ratio

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

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressedImage =
            canvas.toDataURL(
              "image/jpeg",
              0.8
            );

          resolve(compressedImage);
        };

        img.onerror = reject;

        img.src = event.target.result;
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // =====================================================
  // PROCESS FILES
  // =====================================================

  const processFiles = async (files) => {
    const imageFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please select image files only.");
      return;
    }

    // Maximum 12 photos

    if (
      photos.length + imageFiles.length >
      12
    ) {
      alert(
        "You can upload maximum 12 business photos."
      );

      return;
    }

    try {
      setUploading(true);

      const newPhotos = [];

      for (const file of imageFiles) {
        const imageData =
          await compressImage(file);

        newPhotos.push({
          id:
            Date.now() +
            Math.random()
              .toString(36)
              .substring(2),

          name: file.name,

          image: imageData,

          uploadedAt:
            new Date().toISOString(),

          isCover:
            photos.length === 0 &&
            newPhotos.length === 0,
        });
      }

      const updatedPhotos = [
        ...photos,
        ...newPhotos,
      ];

      savePhotos(updatedPhotos);
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      alert(
        "Something went wrong while uploading photos."
      );
    } finally {
      setUploading(false);
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

    // Allow selecting same file again

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
  // DRAG LEAVE
  // =====================================================

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
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

  const handleDelete = (photoId) => {
    const photoToDelete =
      photos.find(
        (photo) =>
          photo.id === photoId
      );

    if (!photoToDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmed) return;

    let updatedPhotos =
      photos.filter(
        (photo) =>
          photo.id !== photoId
      );

    // If deleted photo was cover,
    // make first remaining photo cover

    if (
      photoToDelete.isCover &&
      updatedPhotos.length > 0
    ) {
      updatedPhotos =
        updatedPhotos.map(
          (photo, index) => ({
            ...photo,
            isCover: index === 0,
          })
        );
    }

    savePhotos(updatedPhotos);
  };

  // =====================================================
  // SET COVER PHOTO
  // =====================================================

  const handleSetCover = (photoId) => {
    const updatedPhotos =
      photos.map((photo) => ({
        ...photo,

        isCover:
          photo.id === photoId,
      }));

    savePhotos(updatedPhotos);
  };

  return (
    <MainLayout>
      <div className="owner-photos-page">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="owner-photos-topbar">

          <button
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
            <FaCloudUploadAlt />
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
            onClick={() =>
              fileInputRef.current?.click()
            }
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
            JPG, PNG or WEBP • Maximum 12 photos
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
                  These photos will be used
                  on your public business profile.
                </p>
              </div>

              <div className="photos-number">
                <FaImage />
                {photos.length}
              </div>

            </div>


            <div className="photos-grid">

              {photos.map((photo) => (
                <div
                  className={`photo-card ${
                    photo.isCover
                      ? "photo-card-cover"
                      : ""
                  }`}
                  key={photo.id}
                >

                  {/* Image */}

                  <div className="photo-image-wrapper">

                    <img
                      src={photo.image}
                      alt={
                        photo.name ||
                        "Business"
                      }
                      className="business-photo"
                    />


                    {/* Cover Badge */}

                    {photo.isCover && (
                      <div className="cover-badge">
                        <FaStar />
                        Cover Photo
                      </div>
                    )}


                    {/* Actions */}

                    <div className="photo-actions">

                      {!photo.isCover && (
                        <button
                          type="button"
                          className="photo-action-btn"
                          title="Set as cover"
                          onClick={() =>
                            handleSetCover(
                              photo.id
                            )
                          }
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
                            photo.id
                          )
                        }
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </div>


                  {/* Photo Footer */}

                  <div className="photo-card-footer">

                    <span
                      className="photo-name"
                      title={photo.name}
                    >
                      {photo.name}
                    </span>

                    {photo.isCover && (
                      <span className="cover-check">
                        <FaCheck />
                      </span>
                    )}

                  </div>

                </div>
              ))}

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
              onClick={() =>
                fileInputRef.current?.click()
              }
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