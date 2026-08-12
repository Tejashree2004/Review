import { useState } from "react";
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

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // SAVE BUSINESS
  // =========================================

  const handleSubmit = (e) => {
    e.preventDefault();

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

    try {
      setSaving(true);

      // =========================================
      // TEMPORARY FRONTEND STORAGE
      // Later replace with backend API
      // =========================================

      localStorage.setItem(
        "ownerBusiness",
        JSON.stringify(formData)
      );

      localStorage.setItem(
        "businessCreated",
        "true"
      );

      alert("Business information saved successfully!");

      navigate("/owner-dashboard");

    } catch (error) {
      console.error("Business save error:", error);

      alert("Something went wrong. Please try again.");

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="owner-business-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="business-form-header">

        <button
          type="button"
          className="business-back-btn"
          onClick={() => navigate("/owner-dashboard")}
        >
          <FaArrowLeft />
        </button>

        <div className="business-header-logo">
          REVIO
        </div>

        <div className="business-header-space"></div>

      </header>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="business-form-main">

        {/* Heading */}

        <section className="business-form-intro">

          <span className="business-form-label">
            BUSINESS INFORMATION
          </span>

          <h1>
            Add your business
          </h1>

          <p>
            Tell customers about your business.
            This information will appear on your
            REVIO public profile.
          </p>

        </section>


        {/* =========================================
            FORM
        ========================================= */}

        <form
          className="business-form"
          onSubmit={handleSubmit}
        >

          {/* =====================================
              BASIC INFORMATION
          ===================================== */}

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

                <option value="Other">
                  Other
                </option>

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


          {/* =====================================
              LOCATION
          ===================================== */}

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


          {/* =====================================
              CONTACT
          ===================================== */}

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


          {/* =====================================
              OPENING HOURS
          ===================================== */}

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

              {/* Opening */}

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


              {/* Closing */}

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


          {/* =====================================
              SAVE
          ===================================== */}

          <div className="business-form-actions">

            <button
              type="button"
              className="cancel-business-btn"
              onClick={() =>
                navigate("/owner-dashboard")
              }
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
                : "Save Business"
              }

            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default OwnerBusinessProfile;