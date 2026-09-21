import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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
import DialogBox from "../components/DialogBox";

import "../styles/OwnerPhotos.css";

const API_BASE =
  "http://localhost:5213/api";

const BACKEND_BASE =
  "http://localhost:5213";

const MAX_PHOTOS = 12;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

function OwnerPhotos() {
  const navigate = useNavigate();

  const {
    businessId: routeBusinessId,
  } = useParams();

  const fileInputRef =
    useRef(null);

  const [business, setBusiness] =
    useState(null);

  const [businessId, setBusinessId] =
    useState(
      routeBusinessId
        ? Number(routeBusinessId)
        : null
    );

  const [photos, setPhotos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  // =====================================================
  // DIALOG STATE
  // =====================================================

  const [dialog, setDialog] =
    useState({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      action: null,
    });

  // =====================================================
  // SHOW DIALOG
  // =====================================================

  const showDialog = (
    title,
    message,
    type = "info",
    action = null,
    options = {}
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText:
        options.confirmText || "OK",
      cancelText:
        options.cancelText || "Cancel",
      showCancel:
        options.showCancel || false,
      action,
    });
  };

  // =====================================================
  // CLOSE DIALOG
  // =====================================================

  const closeDialog = () => {
    setDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  // =====================================================
  // HANDLE DIALOG CONFIRM
  // =====================================================

  const handleDialogConfirm = () => {
    const action = dialog.action;

    closeDialog();

    if (action) {
      action();
    }
  };

  // =====================================================
  // TOKEN
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
  // RESPONSE DATA
  // =====================================================

  const getResponseData = (
    response
  ) => {
    return (
      response?.data?.data ??
      response?.data?.Data ??
      response?.data
    );
  };

  // =====================================================
  // PHOTO ID
  // =====================================================

  const getPhotoId = (photo) => {
    return (
      photo?.businessPhotoId ??
      photo?.BusinessPhotoId ??
      photo?.id ??
      photo?.Id ??
      null
    );
  };

  // =====================================================
  // PHOTO URL
  // =====================================================

  const getPhotoUrl = (photo) => {
    const rawUrl =
      photo?.photoUrl ??
      photo?.PhotoUrl ??
      photo?.imageUrl ??
      photo?.ImageUrl ??
      photo?.image ??
      photo?.Image ??
      "";

    if (!rawUrl) {
      return "";
    }

    let cleanUrl =
      String(rawUrl).trim();

    if (!cleanUrl) {
      return "";
    }

    cleanUrl =
      cleanUrl.replace(
        /^["']|["']$/g,
        ""
      );

    // Already complete backend URL
    if (
      cleanUrl.startsWith(
        "http://localhost:5213/"
      )
    ) {
      return cleanUrl;
    }

    // Already another complete URL
    if (
      cleanUrl.startsWith(
        "http://"
      ) ||
      cleanUrl.startsWith(
        "https://"
      ) ||
      cleanUrl.startsWith(
        "data:image/"
      )
    ) {
      return cleanUrl;
    }

    // Backend stored path:
    // /uploads/business/example.jpg
    if (
      cleanUrl.startsWith(
        "/uploads/"
      )
    ) {
      return `${BACKEND_BASE}${cleanUrl}`;
    }

    // uploads/business/example.jpg
    if (
      cleanUrl.startsWith(
        "uploads/"
      )
    ) {
      return `${BACKEND_BASE}/${cleanUrl}`;
    }

    // Any other relative path
    return `${BACKEND_BASE}/${cleanUrl.replace(
      /^\/+/,
      ""
    )}`;
  };

  // =====================================================
  // BUSINESS ID
  // =====================================================

  const getBusinessId = (
    businessData
  ) => {
    return (
      businessData?.businessId ??
      businessData?.BusinessId ??
      businessData?.id ??
      businessData?.Id ??
      null
    );
  };

  // =====================================================
  // LOAD BUSINESS + PHOTOS
  // =====================================================

  useEffect(() => {
    loadBusinessAndPhotos();
  }, [routeBusinessId]);

  const loadBusinessAndPhotos =
    async () => {
      const token = getToken();

      if (!token) {
        showDialog(
          "Login Required",
          "Your login session has expired. Please login again.",
          "warning",
          () => navigate("/login")
        );

        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      };

      try {
        setLoading(true);

        let ownerBusiness = null;

        // ===============================================
        // SELECTED BUSINESS
        // ===============================================

        if (routeBusinessId) {
          const businessResponse =
            await axios.get(
              `${API_BASE}/owner/business/${routeBusinessId}`,
              config
            );

          ownerBusiness =
            getResponseData(
              businessResponse
            );
        }

        // ===============================================
        // OLD ROUTE
        // ===============================================

        else {
          const businessResponse =
            await axios.get(
              `${API_BASE}/owner/business`,
              config
            );

          const businessData =
            getResponseData(
              businessResponse
            );

          ownerBusiness =
            Array.isArray(
              businessData
            )
              ? businessData[0]
              : businessData;
        }

        // ===============================================
        // BUSINESS NOT FOUND
        // ===============================================

        if (!ownerBusiness) {
          setBusiness(null);
          setBusinessId(null);
          setPhotos([]);

          showDialog(
            "Business Information Required",
            "Please add your business information before uploading photos.",
            "warning",
            () =>
              navigate(
                "/owner/business/new"
              )
          );

          return;
        }

        setBusiness(
          ownerBusiness
        );

        const id =
          getBusinessId(
            ownerBusiness
          );

        console.log(
          "OWNER PHOTOS BUSINESS ID:",
          id
        );

        if (!id) {
          showDialog(
            "Business ID Missing",
            "Business ID was not found. Please save your business information again.",
            "error"
          );

          return;
        }

        setBusinessId(id);

        // ===============================================
        // LOAD PHOTOS
        // ===============================================

        const photoResponse =
          await axios.get(
            `${API_BASE}/owner/photos/business/${id}`,
            config
          );

        const photoData =
          getResponseData(
            photoResponse
          );

        console.log(
          "OWNER BUSINESS PHOTOS:",
          photoData
        );

        setPhotos(
          Array.isArray(photoData)
            ? photoData
            : []
        );
      } catch (error) {
        console.error(
          "Business/photos loading error:",
          error
        );

        console.error(
          "LOAD BACKEND RESPONSE:",
          error?.response?.data
        );

        if (
          error.response?.status ===
          401
        ) {
          showDialog(
            "Session Expired",
            "Your login session has expired. Please login again.",
            "warning",
            () => navigate("/login")
          );

          return;
        }

        if (
          error.response?.status ===
          404
        ) {
          showDialog(
            "Endpoint Not Found",
            "Business or photo endpoint was not found. Please check the backend routes.",
            "error"
          );

          return;
        }

        showDialog(
          "Error",
          "Unable to load business photos.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // PREPARE IMAGE FILE
  // =====================================================

  const prepareImageFile =
    (file) => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !file ||
            !file.type?.startsWith(
              "image/"
            )
          ) {
            reject(
              new Error(
                "Selected file is not an image."
              )
            );

            return;
          }

          const reader =
            new FileReader();

          reader.onload =
            (event) => {
              const image =
                new Image();

              image.onload =
                () => {
                  try {
                    const maxWidth =
                      900;

                    const maxHeight =
                      900;

                    let width =
                      image.width;

                    let height =
                      image.height;

                    // =================================
                    // RESIZE WIDTH
                    // =================================

                    if (
                      width >
                      maxWidth
                    ) {
                      height =
                        (height *
                          maxWidth) /
                        width;

                      width =
                        maxWidth;
                    }

                    // =================================
                    // RESIZE HEIGHT
                    // =================================

                    if (
                      height >
                      maxHeight
                    ) {
                      width =
                        (width *
                          maxHeight) /
                        height;

                      height =
                        maxHeight;
                    }

                    const canvas =
                      document.createElement(
                        "canvas"
                      );

                    canvas.width =
                      Math.round(
                        width
                      );

                    canvas.height =
                      Math.round(
                        height
                      );

                    const context =
                      canvas.getContext(
                        "2d"
                      );

                    if (!context) {
                      reject(
                        new Error(
                          "Unable to process selected image."
                        )
                      );

                      return;
                    }

                    context.drawImage(
                      image,
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );

                    // =================================
                    // CONVERT TO REAL JPEG FILE
                    // =================================

                    canvas.toBlob(
                      (blob) => {
                        if (!blob) {
                          reject(
                            new Error(
                              "Unable to prepare image for upload."
                            )
                          );

                          return;
                        }

                        const originalName =
                          file.name ||
                          "business-photo";

                        const baseName =
                          originalName
                            .replace(
                              /\.[^/.]+$/,
                              ""
                            )
                            .replace(
                              /[^a-zA-Z0-9_-]/g,
                              "-"
                            );

                        const finalFileName =
                          `${baseName}-${Date.now()}.jpg`;

                        const compressedFile =
                          new File(
                            [blob],
                            finalFileName,
                            {
                              type:
                                "image/jpeg",
                              lastModified:
                                Date.now(),
                            }
                          );

                        console.log(
                          "PREPARED IMAGE:",
                          {
                            originalName:
                              file.name,
                            originalSize:
                              file.size,
                            preparedName:
                              compressedFile.name,
                            preparedSize:
                              compressedFile.size,
                            preparedType:
                              compressedFile.type,
                          }
                        );

                        resolve(
                          compressedFile
                        );
                      },
                      "image/jpeg",
                      0.55
                    );
                  } catch (error) {
                    reject(error);
                  }
                };

              image.onerror =
                () => {
                  reject(
                    new Error(
                      "Unable to read selected image."
                    )
                  );
                };

              image.src =
                event.target.result;
            };

          reader.onerror =
            () => {
              reject(
                new Error(
                  "Unable to read selected file."
                )
              );
            };

          reader.readAsDataURL(
            file
          );
        }
      );
    };

  // =====================================================
  // UPLOAD PHOTO
  // =====================================================

  const uploadPhoto =
    async (
      imageFile,
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

      if (
        !imageFile ||
        !(imageFile instanceof File)
      ) {
        throw new Error(
          "Invalid photo file."
        );
      }

      // ===============================================
      // DEBUG
      // ===============================================

      console.log(
        "========== PHOTO UPLOAD REQUEST =========="
      );

      console.log(
        "BUSINESS ID:",
        businessId
      );

      console.log(
        "FILE:",
        imageFile
      );

      console.log(
        "FILE NAME:",
        imageFile.name
      );

      console.log(
        "FILE TYPE:",
        imageFile.type
      );

      console.log(
        "FILE SIZE:",
        imageFile.size
      );

      console.log(
        "IS PRIMARY:",
        isPrimary
      );

      // ===============================================
      // FORM DATA
      // ===============================================

      const formData =
        new FormData();

      formData.append(
        "Photo",
        imageFile,
        imageFile.name
      );

      formData.append(
        "Caption",
        fileName ||
          imageFile.name ||
          "Business photo"
      );

      formData.append(
        "IsPrimary",
        String(
          Boolean(isPrimary)
        )
      );

      // ===============================================
      // DO NOT SET CONTENT-TYPE MANUALLY
      // ===============================================

      const response =
        await axios.post(
          `${API_BASE}/owner/photos/business/${businessId}`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "PHOTO UPLOAD SUCCESS:",
        response.data
      );

      console.log(
        "=========================================="
      );

      return getResponseData(
        response
      );
    };

  // =====================================================
  // LOAD PHOTOS ONLY
  // =====================================================

  const loadBusinessPhotosOnly =
    async () => {
      const token = getToken();

      if (
        !token ||
        !businessId
      ) {
        return;
      }

      try {
        const response =
          await axios.get(
            `${API_BASE}/owner/photos/business/${businessId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          getResponseData(
            response
          );

        console.log(
          "REFRESHED BUSINESS PHOTOS:",
          data
        );

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

        console.error(
          "REFRESH PHOTOS RESPONSE:",
          error?.response?.data
        );
      }
    };

  // =====================================================
  // PROCESS FILES
  // =====================================================

  const processFiles =
    async (files) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      // ===============================================
      // ACCEPTED FILE TYPES
      // ===============================================

      const imageFiles =
        Array.from(files).filter(
          (file) =>
            file.type ===
              "image/jpeg" ||
            file.type ===
              "image/png" ||
            file.type ===
              "image/webp"
        );

      if (
        imageFiles.length === 0
      ) {
        showDialog(
          "Invalid File",
          "Please select JPG, PNG or WEBP image files only.",
          "warning"
        );

        return;
      }

      // ===============================================
      // MAX 12 PHOTOS
      // ===============================================

      if (
        photos.length +
          imageFiles.length >
        MAX_PHOTOS
      ) {
        showDialog(
          "Photo Limit Reached",
          `You can upload maximum 12 business photos. You currently have ${photos.length} photos.`,
          "warning"
        );

        return;
      }

      // ===============================================
      // ORIGINAL FILE SIZE CHECK
      // ===============================================

      const oversizedFile =
        imageFiles.find(
          (file) =>
            file.size >
            MAX_FILE_SIZE
        );

      if (oversizedFile) {
        showDialog(
          "File Too Large",
          "Each image must be smaller than 5 MB.",
          "warning"
        );

        return;
      }

      try {
        setUploading(true);

        const uploadedPhotos =
          [];

        // ===============================================
        // UPLOAD ONE BY ONE
        // ===============================================

        for (
          let index = 0;
          index <
          imageFiles.length;
          index++
        ) {
          const file =
            imageFiles[index];

          console.log(
            `UPLOADING PHOTO ${index + 1}/${imageFiles.length}:`,
            file.name
          );

          // =============================================
          // PREPARE REAL FILE
          // =============================================

          const preparedFile =
            await prepareImageFile(
              file
            );

          // =============================================
          // CHECK PRIMARY
          // =============================================

          const hasPrimaryPhoto =
            photos.some(
              (photo) =>
                photo?.isPrimary ===
                  true ||
                photo?.IsPrimary ===
                  true
            );

          const isPrimary =
            !hasPrimaryPhoto &&
            uploadedPhotos.length ===
              0;

          // =============================================
          // UPLOAD
          // =============================================

          const savedPhoto =
            await uploadPhoto(
              preparedFile,
              file.name,
              isPrimary
            );

          if (savedPhoto) {
            uploadedPhotos.push(
              savedPhoto
            );
          }
        }

        // ===============================================
        // REFRESH
        // ===============================================

        await loadBusinessPhotosOnly();

        showDialog(
          "Upload Successful",
          uploadedPhotos.length ===
            1
            ? "Photo uploaded successfully!"
            : `${uploadedPhotos.length} photos uploaded successfully!`,
          "success"
        );
      } catch (error) {
        console.error(
          "Photo upload error:",
          error
        );

        // ===============================================
        // IMPORTANT BACKEND DEBUG
        // ===============================================

        console.log(
          "========== PHOTO UPLOAD DEBUG =========="
        );

        console.log(
          "STATUS:",
          error?.response?.status
        );

        console.log(
          "BACKEND RESPONSE:",
          error?.response?.data
        );

        console.log(
          "BACKEND MESSAGE:",
          error?.response?.data?.message
        );

        console.log(
          "BACKEND ERROR:",
          error?.response?.data?.error
        );

        console.log(
          "========================================="
        );

        // ===============================================
        // 400
        // ===============================================

        if (
          error.response?.status ===
          400
        ) {
          const responseData =
            error.response?.data;

          const message =
            responseData?.message ??
            responseData?.Message ??
            responseData?.error ??
            responseData?.Error ??
            "";

          showDialog(
            "Upload Failed",
            message ||
              "Invalid photo data. The backend rejected the image.",
            "error"
          );

          return;
        }

        // ===============================================
        // 401
        // ===============================================

        if (
          error.response?.status ===
          401
        ) {
          showDialog(
            "Session Expired",
            "Your login session has expired. Please login again.",
            "warning",
            () =>
              navigate("/login")
          );

          return;
        }

        // ===============================================
        // 413
        // ===============================================

        if (
          error.response?.status ===
          413
        ) {
          showDialog(
            "File Too Large",
            "The uploaded image is too large. Please choose a smaller image.",
            "warning"
          );

          return;
        }

        // ===============================================
        // GENERAL ERROR
        // ===============================================

        showDialog(
          "Upload Failed",
          error.message ||
            "Something went wrong while uploading the photo.",
          "error"
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================================
  // INPUT
  // =====================================================

  const handleFileChange =
    (event) => {
      const files =
        event.target.files;

      if (
        files &&
        files.length > 0
      ) {
        processFiles(files);
      }

      event.target.value = "";
    };

  // =====================================================
  // DRAG ENTER
  // =====================================================

  const handleDragEnter =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
    };

  // =====================================================
  // DRAG OVER
  // =====================================================

  const handleDragOver =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
    };

  // =====================================================
  // DRAG LEAVE
  // =====================================================

  const handleDragLeave =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);
    };

  // =====================================================
  // DROP
  // =====================================================

  const handleDrop =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);

      const files =
        event.dataTransfer.files;

      if (
        files &&
        files.length > 0
      ) {
        processFiles(files);
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete =
    async (photo) => {
      const photoId =
        getPhotoId(photo);

      if (!photoId) {
        showDialog(
          "Photo ID Missing",
          "Photo ID not found.",
          "error"
        );

        return;
      }

      showDialog(
        "Delete Photo",
        "Are you sure you want to delete this photo?",
        "warning",
        () =>
          confirmDeletePhoto(
            photoId
          ),
        {
          confirmText:
            "Delete",
          cancelText:
            "Cancel",
          showCancel:
            true,
        }
      );
    };

  // =====================================================
  // CONFIRM DELETE PHOTO
  // =====================================================

  const confirmDeletePhoto =
    async (photoId) => {
      const token = getToken();

      if (!token) {
        showDialog(
          "Login Required",
          "Please login again.",
          "warning",
          () => navigate("/login")
        );

        return;
      }

      try {
        setUploading(true);

        await axios.delete(
          `${API_BASE}/owner/photos/${photoId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        await loadBusinessPhotosOnly();

        showDialog(
          "Photo Deleted",
          "Photo deleted successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Delete photo error:",
          error
        );

        console.error(
          "DELETE BACKEND RESPONSE:",
          error?.response?.data
        );

        if (
          error.response?.status ===
          401
        ) {
          showDialog(
            "Session Expired",
            "Your login session has expired. Please login again.",
            "warning",
            () => navigate("/login")
          );

          return;
        }

        showDialog(
          "Delete Failed",
          "Unable to delete photo.",
          "error"
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================================
  // PRIMARY
  // =====================================================

  const handleSetPrimary =
    async (photo) => {
      const photoId =
        getPhotoId(photo);

      if (!photoId) {
        showDialog(
          "Photo ID Missing",
          "Photo ID not found.",
          "error"
        );

        return;
      }

      showDialog(
        "Set Primary Photo",
        "Do you want to make this photo your cover photo?",
        "warning",
        () =>
          confirmSetPrimary(
            photoId
          ),
        {
          confirmText:
            "Set Primary",
          cancelText:
            "Cancel",
          showCancel:
            true,
        }
      );
    };

  // =====================================================
  // CONFIRM PRIMARY
  // =====================================================

  const confirmSetPrimary =
    async (photoId) => {
      const token = getToken();

      if (!token) {
        showDialog(
          "Login Required",
          "Please login again.",
          "warning",
          () => navigate("/login")
        );

        return;
      }

      try {
        setUploading(true);

        await axios.put(
          `${API_BASE}/owner/photos/${photoId}/primary`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        await loadBusinessPhotosOnly();

        showDialog(
          "Primary Photo Updated",
          "This photo is now your cover photo.",
          "success"
        );
      } catch (error) {
        console.error(
          "Set primary photo error:",
          error
        );

        console.error(
          "PRIMARY BACKEND RESPONSE:",
          error?.response?.data
        );

        if (
          error.response?.status ===
          401
        ) {
          showDialog(
            "Session Expired",
            "Your login session has expired. Please login again.",
            "warning",
            () => navigate("/login")
          );

          return;
        }

        if (
          error.response?.status ===
          404
        ) {
          showDialog(
            "Photo Not Found",
            "The selected photo could not be found.",
            "error"
          );

          return;
        }

        showDialog(
          "Update Failed",
          "Unable to change the primary photo.",
          "error"
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================================
  // OPEN PICKER
  // =====================================================

  const openFilePicker =
    () => {
      if (uploading) {
        return;
      }

      if (
        photos.length >=
        MAX_PHOTOS
      ) {
        showDialog(
          "Photo Limit Reached",
          "You already have 12 business photos.",
          "warning"
        );

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
              minHeight:
                "70vh",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              gap:
                "15px",
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

          <DialogBox
            isOpen={
              dialog.isOpen
            }
            title={
              dialog.title
            }
            message={
              dialog.message
            }
            type={
              dialog.type
            }
            confirmText={
              dialog.confirmText
            }
            onConfirm={
              handleDialogConfirm
            }
            onCancel={
              closeDialog
            }
            showCancel={
              dialog.showCancel
            }
          />
        </div>
      </MainLayout>
    );
  }

  // =====================================================
  // UI
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
              navigate(
                "/owner-dashboard"
              )
            }
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
                marginTop:
                  "8px",
                fontWeight:
                  "600",
              }}
            >
              {business?.businessName ??
                business?.BusinessName}
            </p>
          )}

        </section>

        {/* =================================================
            UPLOAD BOX
        ================================================= */}

        <section
          className={`photo-upload-box ${
            isDragging
              ? "photo-upload-dragging"
              : ""
          }`}
          onDragEnter={
            handleDragEnter
          }
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
        >

          <div className="upload-icon">

            {uploading ? (
              <FaSpinner
                className="fa-spin"
              />
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
            onClick={
              openFilePicker
            }
            disabled={
              uploading
            }
          >
            <FaCamera />

            {uploading
              ? "Uploading..."
              : "Choose Photos"}
          </button>

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={
              handleFileChange
            }
            hidden
          />

          <div className="upload-info">
            JPG, PNG or WEBP • Maximum 12 photos • Maximum 5 MB per image
          </div>

        </section>

        {/* =================================================
            PHOTOS
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
                (
                  photo,
                  index
                ) => {

                  const photoUrl =
                    getPhotoUrl(
                      photo
                    );

                  const photoId =
                    getPhotoId(
                      photo
                    );

                  const isPrimary =
                    photo?.isPrimary ===
                      true ||
                    photo?.IsPrimary ===
                      true;

                  const caption =
                    photo?.caption ??
                    photo?.Caption ??
                    `Business Photo ${
                      index + 1
                    }`;

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

                      <div className="photo-image-wrapper">

                        {photoUrl ? (
                          <img
                            src={
                              photoUrl
                            }
                            alt={
                              caption
                            }
                            className="business-photo"
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            <FaImage
                              size={
                                40
                              }
                            />
                          </div>
                        )}

                        {/* =================================
                            COVER BADGE
                        ================================= */}

                        {isPrimary && (
                          <div className="cover-badge">
                            <FaStar />
                            Cover Photo
                          </div>
                        )}

                        {/* =================================
                            ACTIONS
                        ================================= */}

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
                              disabled={
                                uploading
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
                                photo
                              )
                            }
                            disabled={
                              uploading
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </div>

                      {/* =================================
                          FOOTER
                      ================================= */}

                      <div className="photo-card-footer">

                        <span
                          className="photo-name"
                          title={
                            caption
                          }
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
              onClick={
                openFilePicker
              }
              disabled={
                uploading
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

      {/* =================================================
          DIALOG
      ================================================= */}

      <DialogBox
        isOpen={
          dialog.isOpen
        }
        title={
          dialog.title
        }
        message={
          dialog.message
        }
        type={
          dialog.type
        }
        confirmText={
          dialog.confirmText
        }
        onConfirm={
          handleDialogConfirm
        }
        onCancel={
          closeDialog
        }
        showCancel={
          dialog.showCancel
        }
      />

    </MainLayout>
  );
}

export default OwnerPhotos;