
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaGlobe,
  FaSave,
} from "react-icons/fa";

import "../styles/OwnerBusinessProfile.css";

function OwnerBusinessProfile() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5213/api";

  const [formData, setFormData] = useState({
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
    workingDays: "Monday - Sunday",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [businessId, setBusinessId] = useState(null);

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
  // LOAD CATEGORIES + EXISTING BUSINESS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        // =================================================
        // LOAD CATEGORIES
        // =================================================

        const categoryResponse = await axios.get(
          `${API_BASE}/Home/categories`
        );

        const categoryData = getResponseData(categoryResponse);

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        );

        // =================================================
        // LOAD OWNER BUSINESS
        // GET: /api/owner/business
        // =================================================

        const businessResponse = await axios.get(
          `${API_BASE}/owner/business`,
          config
        );

        const businessData =
          getResponseData(businessResponse);

        const business = Array.isArray(businessData)
          ? businessData[0]
          : businessData;

        if (business) {
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
            "";

          setBusinessId(id);

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

          // Keep a local copy for the existing
          // OwnerPublicProfile page.
          localStorage.setItem(
            "businessProfile",
            JSON.stringify(business)
          );

          localStorage.setItem(
            "businessCreated",
            "true"
          );
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.error("Unauthorized.");

          alert(
            "Your login session has expired. Please login again."
          );

          navigate("/login");
        } else if (
          error.response?.status !== 404
        ) {
          console.error(
            "Business data loading error:",
            error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // FIND CATEGORY ID
  // =====================================================

  const getSelectedCategoryId = () => {
    const selectedCategory = categories.find(
      (category) => {
        const categoryName =
          category?.categoryName ??
          category?.CategoryName ??
          "";

        return (
          categoryName.toLowerCase().trim() ===
          formData.businessType.toLowerCase().trim()
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
  // SAVE BUSINESS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!formData.businessName.trim()) {
      alert("Please enter your business name.");
      return;
    }

    if (!formData.businessType) {
      alert("Please select your business type.");
      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter your business address.");
      return;
    }

    if (!formData.city.trim()) {
      alert("Please enter your city.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your contact number.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Please login again before saving your business."
      );

      navigate("/login");
      return;
    }

    // ---------------------------------------------------
    // CATEGORY ID
    // ---------------------------------------------------

    const categoryId = getSelectedCategoryId();

    if (!categoryId) {
      alert(
        "Selected business category was not found. Please refresh the page and try again."
      );

      return;
    }

    // ---------------------------------------------------
    // BACKEND DATA
    // ---------------------------------------------------

    const businessData = {
      categoryId: Number(categoryId),

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

      pincode:
        formData.pincode.trim(),

      website:
        formData.website.trim(),

      openingTime:
        formData.openingTime,

      closingTime:
        formData.closingTime,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      setSaving(true);

      let response;

      // =================================================
      // UPDATE EXISTING BUSINESS
      // PUT: /api/owner/business/{id}
      // =================================================

      if (businessId) {
        response = await axios.put(
          `${API_BASE}/owner/business/${businessId}`,
          {
            ...businessData,
            isOpen: true,
          },
          config
        );
      }

      // =================================================
      // CREATE NEW BUSINESS
      // POST: /api/owner/business
      // =================================================

      else {
        response = await axios.post(
          `${API_BASE}/owner/business`,
          businessData,
          config
        );
      }

      // =================================================
      // GET SAVED BUSINESS FROM RESPONSE
      // =================================================

      const savedBusiness =
        getResponseData(response);

      const savedBusinessId =
        savedBusiness?.businessId ??
        savedBusiness?.BusinessId ??
        businessId;

      // =================================================
      // CREATE FRONTEND BUSINESS OBJECT
      // =================================================

      const categoryObject =
        savedBusiness?.category ??
        savedBusiness?.Category ?? {
          categoryId: Number(categoryId),
          categoryName:
            formData.businessType,
        };

      const businessForFrontend = {
        ...(savedBusiness || {}),

        businessId:
          savedBusinessId,

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

        isOpen:
          savedBusiness?.isOpen ??
          savedBusiness?.IsOpen ??
          true,
      };

      // =================================================
      // SAVE ID
      // =================================================

      setBusinessId(savedBusinessId);

      // =================================================
      // SAVE FOR PUBLIC PROFILE
      // =================================================

      localStorage.setItem(
        "businessProfile",
        JSON.stringify(
          businessForFrontend
        )
      );

      localStorage.setItem(
        "businessCreated",
        "true"
      );

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        businessId
          ? "Business information updated successfully!"
          : "Business information saved successfully!"
      );

      // =================================================
      // GO TO OWNER DASHBOARD
      // =================================================

      navigate("/owner-dashboard");

    } catch (error) {
      console.error(
        "Business save error:",
        error
      );

      // -------------------------------------------------
      // 401
      // -------------------------------------------------

      if (
        error.response?.status === 401
      ) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");

        return;
      }

      // -------------------------------------------------
      // 400
      // -------------------------------------------------

      if (
        error.response?.status === 400
      ) {
        const message =
          error.response?.data?.message ??
          error.response?.data?.Message ??
          "Please check the business information and try again.";

        alert(message);

        return;
      }

      // -------------------------------------------------
      // 404
      // -------------------------------------------------

      if (
        error.response?.status === 404
      ) {
        alert(
          "Business endpoint was not found. Please check the backend route."
        );

        return;
      }

      // -------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------

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
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading business information...
        </div>
      </div>
    );
  }

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
            navigate("/owner-dashboard")
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

        {/* =================================================
            INTRO
        ================================================= */}

        <section className="business-form-intro">

          <span className="business-form-label">
            BUSINESS INFORMATION
          </span>

          <h1>
            {businessId
              ? "Edit your business"
              : "Add your business"}
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
          onSubmit={handleSubmit}
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

            {/* Business Name */}

            <div className="form-group">

              <label>
                Business name
                <span>*</span>
              </label>

              <input
                type="text"
                name="businessName"
                placeholder="e.g. The Grand Palace"
                value={formData.businessName}
                onChange={handleChange}
              />

            </div>

            {/* Business Type */}

            <div className="form-group">

              <label>
                Business type
                <span>*</span>
              </label>

              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
              >

                <option value="">
                  Select business type
                </option>

                {categories.length > 0 ? (
                  categories.map((category) => {
                    const id =
                      category?.categoryId ??
                      category?.CategoryId;

                    const name =
                      category?.categoryName ??
                      category?.CategoryName;

                    return (
                      <option
                        key={id}
                        value={name}
                      >
                        {name}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="Hotel">
                      Hotel
                    </option>

                    <option value="Restaurant">
                      Restaurant
                    </option>

                    <option value="Cafe">
                      Cafe
                    </option>

                    <option value="Salon">
                      Salon
                    </option>

                    <option value="Hospital">
                      Hospital
                    </option>

                    <option value="Shop">
                      Shop
                    </option>
                  </>
                )}

              </select>

            </div>

            {/* Description */}

            <div className="form-group">

              <label>
                Business description
              </label>

              <textarea
                name="description"
                placeholder="Describe your business, services and what makes it special..."
                value={formData.description}
                onChange={handleChange}
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

            {/* Address */}

            <div className="form-group">

              <label>
                Full address
                <span>*</span>
              </label>

              <textarea
                name="address"
                placeholder="Enter your complete business address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />

            </div>

            <div className="form-grid">

              {/* City */}

              <div className="form-group">

                <label>
                  City
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="Pune"
                  value={formData.city}
                  onChange={handleChange}
                />

              </div>

              {/* State */}

              <div className="form-group">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                />

              </div>

              {/* Pincode */}

              <div className="form-group">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  placeholder="411001"
                  value={formData.pincode}
                  onChange={handleChange}
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

              {/* Phone */}

              <div className="form-group">

                <label>
                  Phone number
                  <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>

              {/* Email */}

              <div className="form-group">

                <label>
                  Business email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* Website */}

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
                  value={formData.website}
                  onChange={handleChange}
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

            {/* Working Days */}

            <div className="form-group">

              <label>
                Working days
              </label>

              <select
                name="workingDays"
                value={formData.workingDays}
                onChange={handleChange}
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

              {/* Opening Time */}

              <div className="form-group">

                <label>
                  Opening time
                </label>

                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                />

              </div>

              {/* Closing Time */}

              <div className="form-group">

                <label>
                  Closing time
                </label>

                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                />

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
                navigate("/owner-dashboard")
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-business-btn"
              disabled={saving}
            >

              <FaSave />

              {saving
                ? "Saving..."
                : businessId
                  ? "Update Business"
                  : "Save Business"}

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default OwnerBusinessProfile;

