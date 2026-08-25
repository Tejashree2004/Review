import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaGlobe,
  FaSave,
  FaChevronDown,
  FaCamera,
  FaCloudUploadAlt,
  FaTrash,
  FaStar,
  FaCheck,
  FaImage,
  FaSpinner,
} from "react-icons/fa";

import "../styles/OwnerBusinessProfile.css";

const API_BASE =
  "http://localhost:5213/api";

function OwnerBusinessProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    businessId: routeBusinessId,
  } = useParams();

  const fileInputRef =
    useRef(null);

  const categoryDropdownRef =
    useRef(null);

  // =====================================================
  // ROUTE MODE
  // =====================================================

  /*
    CREATE:
    /owner/business/new

    EDIT:
    /owner/business/2

    LEGACY:
    /owner/business
  */

  const pathname =
    location.pathname;

  const isCreateMode =
    pathname === "/owner/business/new" ||
    routeBusinessId === "new";

  const isEditMode =
    !isCreateMode &&
    routeBusinessId &&
    !Number.isNaN(
      Number(routeBusinessId)
    );

  const isLegacyMode =
    !isCreateMode &&
    !isEditMode &&
    pathname === "/owner/business";

  const routeBusinessIdNumber =
    isEditMode
      ? Number(routeBusinessId)
      : null;

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    businessName: "",
    businessType: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    openingTime: "",
    closingTime: "",
    workingDays:
      "Monday - Sunday",
  };

  // =====================================================
  // STATE
  // =====================================================

  const [formData, setFormData] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [categories, setCategories] =
    useState([]);

  /*
    Business ID is assigned only when:
    1. Editing an existing business
    2. Backend returns a newly-created business ID
  */

  const [businessId, setBusinessId] =
    useState(
      isEditMode
        ? routeBusinessIdNumber
        : null
    );

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  // =====================================================
  // PHOTOS STATE
  // =====================================================

  const [photos, setPhotos] =
    useState([]);

  const [uploading, setUploading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  /*
    For CREATE mode, photos are selected first.

    They are uploaded only after the business has
    successfully been created and the backend returns
    the new BusinessId.
  */

  const [pendingPhotoFiles, setPendingPhotoFiles] =
    useState([]);

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

  const getPhotoId = (
    photo
  ) => {
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

  const getPhotoUrl = (
    photo
  ) => {
    return (
      photo?.photoUrl ??
      photo?.PhotoUrl ??
      photo?.image ??
      photo?.Image ??
      ""
    );
  };

  // =====================================================
  // PHOTO PRIMARY
  // =====================================================

  const isPrimaryPhoto = (
    photo
  ) => {
    return (
      photo?.isPrimary === true ||
      photo?.IsPrimary === true
    );
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
      null
    );
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories =
    async () => {
      try {
        const response =
          await axios.get(
            `${API_BASE}/Home/categories`
          );

        const data =
          getResponseData(response);

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );

        setCategories([]);
      }
    };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      ...emptyForm,
    });

    /*
      IMPORTANT:
      New business must not inherit an old BusinessId.
    */

    setBusinessId(null);

    setPhotos([]);

    setPendingPhotoFiles([]);

    localStorage.removeItem(
      "businessProfile"
    );
  };

  // =====================================================
  // SET BUSINESS FORM
  // =====================================================

  const setBusinessForm = (
    business
  ) => {
    if (!business) {
      return;
    }

    const category =
      business.category ??
      business.Category;

    const id =
      business.businessId ??
      business.BusinessId ??
      null;

    const categoryName =
      category?.categoryName ??
      category?.CategoryName ??
      business.categoryName ??
      business.CategoryName ??
      "";

    setBusinessId(
      id
        ? Number(id)
        : null
    );

    setFormData({
      businessName:
        business.businessName ??
        business.BusinessName ??
        "",

      businessType:
        categoryName,

      description:
        business.description ??
        business.Description ??
        "",

      address:
        business.address ??
        business.Address ??
        "",

      city:
        business.city ??
        business.City ??
        "",

      state:
        business.state ??
        business.State ??
        "",

      pincode:
        business.pincode ??
        business.Pincode ??
        "",

      phone:
        business.phoneNumber ??
        business.PhoneNumber ??
        "",

      email:
        business.email ??
        business.Email ??
        "",

      website:
        business.website ??
        business.Website ??
        "",

      openingTime:
        business.openingTime ??
        business.OpeningTime ??
        "",

      closingTime:
        business.closingTime ??
        business.ClosingTime ??
        "",

      workingDays:
        business.workingDays ??
        business.WorkingDays ??
        "Monday - Sunday",
    });

    localStorage.setItem(
      "businessProfile",
      JSON.stringify(
        business
      )
    );
  };

  // =====================================================
  // LOAD PHOTOS
  // =====================================================

  const loadBusinessPhotos =
    async (
      id
    ) => {
      if (!id) {
        setPhotos([]);
        return;
      }

      const token =
        getToken();

      if (!token) {
        return;
      }

      try {
        const response =
          await axios.get(
            `${API_BASE}/owner/photos/business/${id}`,
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

        setPhotos(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load business photos:",
          error
        );

        setPhotos([]);
      }
    };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadData =
      async () => {
        const token =
          getToken();

        if (!token) {
          setLoading(false);

          navigate(
            "/login"
          );

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

          await loadCategories();

          if (cancelled) {
            return;
          }

          // =================================================
          // CREATE MODE
          // =================================================

          if (isCreateMode) {
            console.log(
              "CREATE NEW BUSINESS MODE"
            );

            resetForm();

            setLoading(false);

            return;
          }

          // =================================================
          // EDIT SPECIFIC BUSINESS
          // =================================================

          if (isEditMode) {
            console.log(
              "EDITING BUSINESS:",
              routeBusinessIdNumber
            );

            const response =
              await axios.get(
                `${API_BASE}/owner/business/${routeBusinessIdNumber}`,
                config
              );

            if (cancelled) {
              return;
            }

            const business =
              getResponseData(
                response
              );

            if (!business) {
              alert(
                "Business not found."
              );

              navigate(
                "/owner-dashboard"
              );

              return;
            }

            setBusinessForm(
              business
            );

            const id =
              getBusinessId(
                business
              );

            if (id) {
              await loadBusinessPhotos(
                id
              );
            }

            setLoading(false);

            return;
          }

          // =================================================
          // LEGACY ROUTE
          // =================================================

          if (isLegacyMode) {
            console.log(
              "LEGACY BUSINESS ROUTE"
            );

            const response =
              await axios.get(
                `${API_BASE}/owner/business`,
                config
              );

            if (cancelled) {
              return;
            }

            const data =
              getResponseData(
                response
              );

            const businesses =
              Array.isArray(data)
                ? data
                : [];

            if (
              businesses.length > 0
            ) {
              setBusinessForm(
                businesses[0]
              );

              const id =
                getBusinessId(
                  businesses[0]
                );

              if (id) {
                await loadBusinessPhotos(
                  id
                );
              }
            } else {
              resetForm();
            }

            setLoading(false);

            return;
          }

          // =================================================
          // UNKNOWN ROUTE
          // =================================================

          console.warn(
            "Unknown OwnerBusinessProfile route:",
            pathname
          );

          resetForm();
        } catch (error) {
          console.error(
            "Business data loading error:",
            error
          );

          if (
            error.response?.status ===
            401
          ) {
            alert(
              "Your login session has expired. Please login again."
            );

            navigate(
              "/login"
            );

            return;
          }

          if (
            error.response?.status ===
            404
          ) {
            alert(
              "Business not found."
            );

            navigate(
              "/owner-dashboard"
            );

            return;
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    routeBusinessId,
    navigate,
  ]);

  // =====================================================
  // CLOSE CATEGORY DROPDOWN
  // =====================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          categoryDropdownRef.current &&
          !categoryDropdownRef.current.contains(
            event.target
          )
        ) {
          setCategoryOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =====================================================
  // CATEGORY SELECT
  // =====================================================

  const handleCategorySelect =
    (
      categoryName
    ) => {
      setFormData(
        (previous) => ({
          ...previous,
          businessType:
            categoryName,
        })
      );

      setCategoryOpen(
        false
      );
    };

  // =====================================================
  // CATEGORY ID
  // =====================================================

  const getSelectedCategoryId =
    () => {
      const selectedCategory =
        categories.find(
          (category) => {
            const categoryName =
              category?.categoryName ??
              category?.CategoryName ??
              "";

            return (
              categoryName
                .toLowerCase()
                .trim() ===
              formData.businessType
                .toLowerCase()
                .trim()
            );
          }
        );

      return (
        selectedCategory?.categoryId ??
        selectedCategory?.CategoryId ??
        null
      );
    };

  // =====================================================
  // COMPRESS IMAGE
  // =====================================================

  const compressImage =
    (file) => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !file ||
            !file.type.startsWith(
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

                    context.drawImage(
                      image,
                      0,
                      0,
                      canvas.width,
                      canvas.height
                    );

                    const compressed =
                      canvas.toDataURL(
                        "image/jpeg",
                        0.55
                      );

                    resolve(
                      compressed
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
  // VALIDATE PHOTO FILES
  // =====================================================

  const validatePhotoFiles =
    (files) => {
      if (
        !files ||
        files.length === 0
      ) {
        return [];
      }

      const imageFiles =
        Array.from(
          files
        ).filter(
          (file) =>
            file.type ===
              "image/jpeg" ||
            file.type ===
              "image/png" ||
            file.type ===
              "image/webp"
        );

      if (
        imageFiles.length ===
        0
      ) {
        alert(
          "Please select JPG, PNG or WEBP image files only."
        );

        return [];
      }

      const currentPhotoCount =
        photos.length +
        pendingPhotoFiles.length;

      if (
        currentPhotoCount +
          imageFiles.length >
        12
      ) {
        alert(
          `You can upload maximum 12 business photos.`
        );

        return [];
      }

      const oversizedFile =
        imageFiles.find(
          (file) =>
            file.size >
            5 *
              1024 *
              1024
        );

      if (oversizedFile) {
        alert(
          "Each image must be smaller than 5 MB."
        );

        return [];
      }

      return imageFiles;
    };

  // =====================================================
  // PHOTO INPUT
  // =====================================================

  const handlePhotoFiles =
    (files) => {
      const imageFiles =
        validatePhotoFiles(
          files
        );

      if (
        imageFiles.length ===
        0
      ) {
        return;
      }

      /*
        CREATE:
        Keep files temporarily.
      */

      if (!businessId) {
        setPendingPhotoFiles(
          (previous) => [
            ...previous,
            ...imageFiles,
          ]
        );

        return;
      }

      /*
        EDIT:
        Business already exists,
        so upload immediately.
      */

      processExistingBusinessFiles(
        imageFiles
      );
    };

  // =====================================================
  // UPLOAD PHOTO
  // =====================================================

  const uploadPhoto =
    async (
      id,
      imageData,
      fileName,
      isPrimary
    ) => {
      const token =
        getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      if (!id) {
        throw new Error(
          "Business ID not found."
        );
      }

      const payload = {
        PhotoUrl:
          imageData,

        Caption:
          fileName ||
          "Business photo",

        IsPrimary:
          Boolean(
            isPrimary
          ),
      };

      const response =
        await axios.post(
          `${API_BASE}/owner/photos/business/${id}`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      return getResponseData(
        response
      );
    };

  // =====================================================
  // UPLOAD SELECTED FILES TO EXISTING BUSINESS
  // =====================================================

  const processExistingBusinessFiles =
    async (
      imageFiles
    ) => {
      if (
        !imageFiles ||
        imageFiles.length ===
          0 ||
        !businessId
      ) {
        return;
      }

      try {
        setUploading(true);

        const uploadedPhotos =
          [];

        for (
          let index = 0;
          index <
          imageFiles.length;
          index++
        ) {
          const file =
            imageFiles[index];

          const imageData =
            await compressImage(
              file
            );

          const hasPrimaryPhoto =
            photos.some(
              (photo) =>
                isPrimaryPhoto(
                  photo
                )
            );

          const isPrimary =
            !hasPrimaryPhoto &&
            uploadedPhotos.length ===
              0;

          const savedPhoto =
            await uploadPhoto(
              businessId,
              imageData,
              file.name,
              isPrimary
            );

          if (savedPhoto) {
            uploadedPhotos.push(
              savedPhoto
            );
          }
        }

        await loadBusinessPhotos(
          businessId
        );

        if (
          uploadedPhotos.length ===
          1
        ) {
          alert(
            "Photo uploaded successfully!"
          );
        } else if (
          uploadedPhotos.length >
          1
        ) {
          alert(
            `${uploadedPhotos.length} photos uploaded successfully!`
          );
        }
      } catch (error) {
        console.error(
          "Photo upload error:",
          error
        );

        if (
          error.response?.status ===
          400
        ) {
          const message =
            error.response?.data
              ?.message ??
            error.response?.data
              ?.Message ??
            "";

          alert(
            message ||
              "Invalid photo data. The backend rejected the image."
          );

          return;
        }

        if (
          error.response?.status ===
          401
        ) {
          alert(
            "Your login session has expired. Please login again."
          );

          navigate(
            "/login"
          );

          return;
        }

        alert(
          error.message ||
            "Something went wrong while uploading the photo."
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================================
  // UPLOAD PENDING PHOTOS AFTER CREATE
  // =====================================================

  const uploadPendingPhotos =
    async (
      createdBusinessId
    ) => {
      if (
        !createdBusinessId ||
        pendingPhotoFiles.length ===
          0
      ) {
        return;
      }

      const files =
        [...pendingPhotoFiles];

      const uploadedPhotos =
        [];

      for (
        let index = 0;
        index <
        files.length;
        index++
      ) {
        const file =
          files[index];

        const imageData =
          await compressImage(
            file
          );

        /*
          First photo becomes primary
          if the business currently has
          no photos.
        */

        const isPrimary =
          index === 0;

        const savedPhoto =
          await uploadPhoto(
            createdBusinessId,
            imageData,
            file.name,
            isPrimary
          );

        if (savedPhoto) {
          uploadedPhotos.push(
            savedPhoto
          );
        }
      }

      setPendingPhotoFiles(
        []
      );

      return uploadedPhotos;
    };

  // =====================================================
  // DELETE PHOTO
  // =====================================================

  const handleDelete =
    async (
      photo
    ) => {
      const photoId =
        getPhotoId(
          photo
        );

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

      const token =
        getToken();

      if (!token) {
        alert(
          "Please login again."
        );

        navigate(
          "/login"
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

        await loadBusinessPhotos(
          businessId
        );

        alert(
          "Photo deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete photo error:",
          error
        );

        alert(
          "Unable to delete photo."
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================================
  // PRIMARY PHOTO
  // =====================================================

  const handleSetPrimary =
    async () => {
      /*
        Same existing functionality:
        backend SetPrimaryPhoto endpoint
        is not available yet.
      */

      alert(
        "Primary photo is selected automatically when the first photo is uploaded. To change the primary photo, the backend needs a SetPrimaryPhoto endpoint."
      );
    };

  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const openFilePicker =
    () => {
      if (
        saving ||
        uploading
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  // =====================================================
  // FILE INPUT
  // =====================================================

  const handleFileChange =
    (event) => {
      const files =
        event.target.files;

      if (
        files &&
        files.length > 0
      ) {
        handlePhotoFiles(
          files
        );
      }

      event.target.value =
        "";
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
        event.dataTransfer
          .files;

      if (
        files &&
        files.length > 0
      ) {
        handlePhotoFiles(
          files
        );
      }
    };

  // =====================================================
  // REMOVE PENDING PHOTO
  // =====================================================

  const removePendingPhoto =
    (index) => {
      setPendingPhotoFiles(
        (previous) =>
          previous.filter(
            (_, photoIndex) =>
              photoIndex !==
              index
          )
      );
    };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      // =================================================
      // VALIDATION
      // =================================================

      if (
        !formData.businessName.trim()
      ) {
        alert(
          "Please enter your business name."
        );

        return;
      }

      if (
        !formData.businessType
      ) {
        alert(
          "Please select your business type."
        );

        return;
      }

      if (
        !formData.address.trim()
      ) {
        alert(
          "Please enter your business address."
        );

        return;
      }

      if (
        !formData.city.trim()
      ) {
        alert(
          "Please enter your city."
        );

        return;
      }

      if (
        !formData.phone.trim()
      ) {
        alert(
          "Please enter your contact number."
        );

        return;
      }

      // =================================================
      // TOKEN
      // =================================================

      const token =
        getToken();

      if (!token) {
        alert(
          "Please login again before saving your business."
        );

        navigate(
          "/login"
        );

        return;
      }

      // =================================================
      // CATEGORY
      // =================================================

      const categoryId =
        getSelectedCategoryId();

      if (!categoryId) {
        alert(
          "Selected business category was not found. Please refresh the page and try again."
        );

        return;
      }

      // =================================================
      // BUSINESS DATA
      // =================================================

      const businessData = {
        categoryId:
          Number(categoryId),

        businessName:
          formData.businessName.trim(),

        description:
          formData.description.trim(),

        phoneNumber:
          formData.phone.trim(),

        email:
          formData.email.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),

        website:
          formData.website.trim(),

        openingTime:
          formData.openingTime,

        closingTime:
          formData.closingTime,

        workingDays:
          formData.workingDays,
      };

      const config = {
        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      };

      try {
        setSaving(true);

        let response;

        // =================================================
        // CREATE
        // =================================================

        if (isCreateMode) {
          console.log(
            "CREATING NEW BUSINESS"
          );

          console.log(
            "POST DATA:",
            businessData
          );

          response =
            await axios.post(
              `${API_BASE}/owner/business`,
              businessData,
              config
            );
        }

        // =================================================
        // EDIT
        // =================================================

        else {
          if (!businessId) {
            alert(
              "Business ID is missing. Please open the business again."
            );

            return;
          }

          console.log(
            "UPDATING EXISTING BUSINESS:",
            businessId
          );

          response =
            await axios.put(
              `${API_BASE}/owner/business/${businessId}`,
              {
                ...businessData,
                isOpen: true,
              },
              config
            );
        }

        // =================================================
        // RESPONSE
        // =================================================

        const savedBusiness =
          getResponseData(
            response
          );

        const savedBusinessId =
          savedBusiness?.businessId ??
          savedBusiness?.BusinessId ??
          null;

        // =================================================
        // FINAL BUSINESS ID
        // =================================================

        const finalBusinessId =
          isCreateMode
            ? savedBusinessId
            : businessId;

        /*
          New business photos can only be uploaded
          AFTER backend returns the new BusinessId.
        */

        if (
          isCreateMode &&
          pendingPhotoFiles.length >
            0
        ) {
          if (!finalBusinessId) {
            alert(
              "Business was created, but the Business ID was not returned. Photos could not be uploaded."
            );
          } else {
            try {
              setUploading(true);

              await uploadPendingPhotos(
                finalBusinessId
              );
            } catch (photoError) {
              console.error(
                "New business photo upload error:",
                photoError
              );

              alert(
                "Business was created successfully, but some photos could not be uploaded."
              );
            } finally {
              setUploading(false);
            }
          }
        }

        // =================================================
        // FRONTEND BUSINESS OBJECT
        // =================================================

        const categoryObject =
          savedBusiness?.category ??
          savedBusiness?.Category ?? {
            categoryId:
              Number(categoryId),

            categoryName:
              formData.businessType,
          };

        const businessForFrontend = {
          ...(savedBusiness || {}),

          businessId:
            finalBusinessId,

          categoryId:
            Number(categoryId),

          category:
            categoryObject,

          businessName:
            savedBusiness?.businessName ??
            savedBusiness?.BusinessName ??
            formData.businessName,

          description:
            savedBusiness?.description ??
            savedBusiness?.Description ??
            formData.description,

          phoneNumber:
            savedBusiness?.phoneNumber ??
            savedBusiness?.PhoneNumber ??
            formData.phone,

          email:
            savedBusiness?.email ??
            savedBusiness?.Email ??
            formData.email,

          address:
            savedBusiness?.address ??
            savedBusiness?.Address ??
            formData.address,

          city:
            savedBusiness?.city ??
            savedBusiness?.City ??
            formData.city,

          state:
            savedBusiness?.state ??
            savedBusiness?.State ??
            formData.state,

          pincode:
            savedBusiness?.pincode ??
            savedBusiness?.Pincode ??
            formData.pincode,

          website:
            savedBusiness?.website ??
            savedBusiness?.Website ??
            formData.website,

          openingTime:
            savedBusiness?.openingTime ??
            savedBusiness?.OpeningTime ??
            formData.openingTime,

          closingTime:
            savedBusiness?.closingTime ??
            savedBusiness?.ClosingTime ??
            formData.closingTime,

          workingDays:
            savedBusiness?.workingDays ??
            savedBusiness?.WorkingDays ??
            formData.workingDays,

          isOpen:
            savedBusiness?.isOpen ??
            savedBusiness?.IsOpen ??
            true,
        };

        // =================================================
        // STORE
        // =================================================

        if (
          finalBusinessId
        ) {
          localStorage.setItem(
            "businessProfile",
            JSON.stringify(
              businessForFrontend
            )
          );
        }

        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        if (
          isCreateMode
        ) {
          alert(
            "New business created successfully!"
          );
        } else {
          alert(
            "Business information updated successfully!"
          );
        }

        // =================================================
        // GO DASHBOARD
        // =================================================

        navigate(
          "/owner-dashboard",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Business save error:",
          error
        );

        if (
          error.response?.status ===
          401
        ) {
          alert(
            "Your login session has expired. Please login again."
          );

          navigate(
            "/login"
          );

          return;
        }

        if (
          error.response?.status ===
          400
        ) {
          const message =
            error.response?.data?.message ??
            error.response?.data?.Message ??
            "Please check the business information and try again.";

          alert(
            message
          );

          return;
        }

        if (
          error.response?.status ===
          404
        ) {
          alert(
            "Business endpoint was not found. Please check the backend route."
          );

          return;
        }

        alert(
          "Something went wrong while saving the business. Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="owner-business-page">
        <div
          style={{
            minHeight:
              "100vh",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            flexDirection:
              "column",

            gap:
              "12px",
          }}
        >
          <FaSpinner
            className="fa-spin"
            size={28}
          />

          <span>
            Loading business information...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const pageTitle =
    isCreateMode
      ? "Add your business"
      : "Edit your business";

  // =====================================================
  // SUBMIT TEXT
  // =====================================================

  const submitText =
    saving
      ? "Saving..."
      : isCreateMode
        ? "Save Business"
        : "Update Business";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="owner-business-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="business-form-header">

        <button
          type="button"
          className="business-back-btn"
          onClick={() =>
            navigate(
              "/owner-dashboard"
            )
          }
        >
          <FaArrowLeft />
        </button>

        <div className="business-header-logo">
          REVIO
        </div>

        <div className="business-header-space"></div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="business-form-main">

        <section className="business-form-intro">

          <span className="business-form-label">
            BUSINESS INFORMATION
          </span>

          <h1>
            {pageTitle}
          </h1>

          <p>
            Tell customers about your business.
            This information will appear on your
            REVIO public profile.
          </p>

        </section>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="business-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <FaBuilding />
              </div>

              <div>
                <h2>
                  Basic information
                </h2>

                <p>
                  Tell us about your business.
                </p>
              </div>

            </div>


            <div className="form-group">

              <label>
                Business name
                <span>*</span>
              </label>

              <input
                type="text"
                name="businessName"
                placeholder="e.g. The Grand Palace"
                value={
                  formData.businessName
                }
                onChange={
                  handleChange
                }
              />

            </div>


            {/* BUSINESS TYPE */}

            <div className="form-group">

              <label>
                Business type
                <span>*</span>
              </label>

              <div
                className="category-dropdown"
                ref={
                  categoryDropdownRef
                }
              >

                <button
                  type="button"
                  className="category-dropdown-trigger"
                  onClick={() =>
                    setCategoryOpen(
                      (previous) =>
                        !previous
                    )
                  }
                >

                  <span
                    className={
                      formData.businessType
                        ? "category-selected-text"
                        : "category-placeholder"
                    }
                  >
                    {
                      formData.businessType ||
                      "Select business type"
                    }
                  </span>

                  <FaChevronDown
                    className={
                      categoryOpen
                        ? "category-arrow category-arrow-open"
                        : "category-arrow"
                    }
                  />

                </button>


                {categoryOpen && (

                  <div className="category-dropdown-menu">

                    {categories.length >
                    0 ? (

                      categories.map(
                        (
                          category
                        ) => {

                          const id =
                            category?.categoryId ??
                            category?.CategoryId;

                          const name =
                            category?.categoryName ??
                            category?.CategoryName ??
                            "";

                          const selected =
                            formData.businessType
                              .toLowerCase()
                              .trim() ===
                            name
                              .toLowerCase()
                              .trim();

                          return (
                            <button
                              type="button"
                              key={
                                id
                              }
                              className={
                                selected
                                  ? "category-dropdown-option selected"
                                  : "category-dropdown-option"
                              }
                              onClick={() =>
                                handleCategorySelect(
                                  name
                                )
                              }
                            >
                              {name}
                            </button>
                          );
                        }
                      )

                    ) : (

                      <button
                        type="button"
                        className="category-dropdown-option"
                      >
                        No categories available
                      </button>

                    )}

                  </div>

                )}

              </div>

            </div>


            <div className="form-group">

              <label>
                Business description
              </label>

              <textarea
                name="description"
                placeholder="Describe your business, services and what makes it special..."
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows="4"
              />

              <small>
                This description will be visible to users.
              </small>

            </div>

          </section>


          {/* =================================================
              LOCATION
          ================================================= */}

          <section className="form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h2>
                  Location
                </h2>

                <p>
                  Help customers find your business.
                </p>
              </div>

            </div>


            <div className="form-group">

              <label>
                Full address
                <span>*</span>
              </label>

              <textarea
                name="address"
                placeholder="Enter your complete business address"
                value={
                  formData.address
                }
                onChange={
                  handleChange
                }
                rows="3"
              />

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  City
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="Pune"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  placeholder="Maharashtra"
                  value={
                    formData.state
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  placeholder="411001"
                  value={
                    formData.pincode
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CONTACT
          ================================================= */}

          <section className="form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <FaPhone />
              </div>

              <div>
                <h2>
                  Contact information
                </h2>

                <p>
                  Let customers contact your business.
                </p>
              </div>

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  Phone number
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Business email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="business@example.com"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Website
              </label>

              <div className="input-with-icon">

                <FaGlobe />

                <input
                  type="url"
                  name="website"
                  placeholder="https://example.com"
                  value={
                    formData.website
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              OPENING HOURS
          ================================================= */}

          <section className="form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <FaClock />
              </div>

              <div>
                <h2>
                  Opening hours
                </h2>

                <p>
                  Tell customers when you are open.
                </p>
              </div>

            </div>


            <div className="form-group">

              <label>
                Working days
              </label>

              <select
                name="workingDays"
                value={
                  formData.workingDays
                }
                onChange={
                  handleChange
                }
              >

                <option value="Monday - Sunday">
                  Monday - Sunday
                </option>

                <option value="Monday - Saturday">
                  Monday - Saturday
                </option>

                <option value="Monday - Friday">
                  Monday - Friday
                </option>

              </select>

            </div>


            <div className="form-grid">

              <div className="form-group">

                <label>
                  Opening time
                </label>

                <input
                  type="time"
                  name="openingTime"
                  value={
                    formData.openingTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Closing time
                </label>

                <input
                  type="time"
                  name="closingTime"
                  value={
                    formData.closingTime
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              BUSINESS PHOTOS
          ================================================= */}

          <section className="form-section business-photos-form-section">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <FaCamera />
              </div>

              <div>
                <h2>
                  Business Photos
                </h2>

                <p>
                  Add photos to show customers
                  what your business looks like.
                </p>
              </div>

            </div>


            {/* =================================================
                UPLOAD BOX
            ================================================= */}

            <div
              className={`business-form-photo-upload ${
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

              <div className="business-form-upload-icon">

                {uploading ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <FaCloudUploadAlt />
                )}

              </div>


              <h3>
                {uploading
                  ? "Uploading photos..."
                  : "Add business photos"}
              </h3>


              <p>
                Drag and drop photos here
                or choose them from your device.
              </p>


              <button
                type="button"
                className="business-form-choose-photo-btn"
                onClick={
                  openFilePicker
                }
                disabled={
                  saving ||
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


              <div className="business-form-upload-info">
                JPG, PNG or WEBP • Maximum 12 photos • Maximum 5 MB per image
              </div>

            </div>


            {/* =================================================
                PENDING PHOTOS FOR NEW BUSINESS
            ================================================= */}

            {pendingPhotoFiles.length >
              0 && (

              <div className="business-form-pending-photos">

                <div className="business-form-photos-heading">

                  <div>
                    <h3>
                      Selected Photos
                    </h3>

                    <p>
                      These photos will be added
                      after your business is saved.
                    </p>
                  </div>

                  <span>
                    {pendingPhotoFiles.length}/12
                  </span>

                </div>


                <div className="business-form-photos-grid">

                  {pendingPhotoFiles.map(
                    (
                      file,
                      index
                    ) => (

                      <div
                        className="business-form-photo-card"
                        key={`${file.name}-${index}`}
                      >

                        <div className="business-form-photo-preview">

                          <img
                            src={
                              URL.createObjectURL(
                                file
                              )
                            }
                            alt={
                              file.name
                            }
                          />

                          {index ===
                            0 && (

                            <div className="business-form-cover-badge">

                              <FaStar />

                              Cover Photo

                            </div>

                          )}

                          <button
                            type="button"
                            className="business-form-delete-photo"
                            onClick={() =>
                              removePendingPhoto(
                                index
                              )
                            }
                            disabled={
                              saving ||
                              uploading
                            }
                            title="Remove photo"
                          >
                            <FaTrash />
                          </button>

                        </div>


                        <div className="business-form-photo-name">
                          {file.name}
                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* =================================================
                EXISTING PHOTOS
            ================================================= */}

            {photos.length >
              0 && (

              <div className="business-form-existing-photos">

                <div className="business-form-photos-heading">

                  <div>
                    <h3>
                      Your Photos
                    </h3>

                    <p>
                      These photos belong to this
                      business profile.
                    </p>
                  </div>

                  <span>
                    <FaImage />
                    {photos.length}/12
                  </span>

                </div>


                <div className="business-form-photos-grid">

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
                        isPrimaryPhoto(
                          photo
                        );

                      const caption =
                        photo?.caption ??
                        photo?.Caption ??
                        `Business Photo ${
                          index + 1
                        }`;

                      return (
                        <div
                          className={`business-form-photo-card ${
                            isPrimary
                              ? "business-form-photo-cover"
                              : ""
                          }`}
                          key={
                            photoId ??
                            `${photoUrl}-${index}`
                          }
                        >

                          <div className="business-form-photo-preview">

                            {photoUrl ? (

                              <img
                                src={
                                  photoUrl
                                }
                                alt={
                                  caption
                                }
                              />

                            ) : (

                              <div className="business-form-no-photo">
                                <FaImage
                                  size={35}
                                />
                              </div>

                            )}


                            {isPrimary && (

                              <div className="business-form-cover-badge">

                                <FaStar />

                                Cover Photo

                              </div>

                            )}


                            <div className="business-form-photo-actions">

                              {!isPrimary && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetPrimary(
                                      photo
                                    )
                                  }
                                  disabled={
                                    uploading
                                  }
                                  title="Set as primary"
                                >
                                  <FaStar />
                                </button>

                              )}


                              <button
                                type="button"
                                className="business-form-delete-photo"
                                onClick={() =>
                                  handleDelete(
                                    photo
                                  )
                                }
                                disabled={
                                  uploading
                                }
                                title="Delete photo"
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </div>


                          <div className="business-form-photo-footer">

                            <span
                              title={
                                caption
                              }
                            >
                              {caption}
                            </span>

                            {isPrimary && (

                              <FaCheck />

                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            )}


            {/* =================================================
                EMPTY PHOTOS
            ================================================= */}

            {photos.length ===
              0 &&
              pendingPhotoFiles.length ===
                0 && (

              <div className="business-form-empty-photos">

                <FaImage />

                <h3>
                  No photos added yet
                </h3>

                <p>
                  Add photos of your business
                  to make your REVIO profile
                  more attractive.
                </p>

              </div>

            )}


            <div className="business-form-photo-tip">

              <FaCheck />

              <div>

                <strong>
                  Make your profile stand out
                </strong>

                <p>
                  Add an exterior view,
                  interior, menu, rooms,
                  services and other important
                  areas of your business.
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="business-form-actions">

            <button
              type="button"
              className="cancel-business-btn"
              onClick={() =>
                navigate(
                  "/owner-dashboard"
                )
              }
              disabled={
                saving ||
                uploading
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="save-business-btn"
              disabled={
                saving ||
                uploading
              }
            >

              {saving ||
              uploading ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <FaSave />
              )}

              {submitText}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default OwnerBusinessProfile;