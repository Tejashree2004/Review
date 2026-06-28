import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

// 👉 ADDED: backend API
import { signupUser } from "../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) {
      alert("Please accept Terms & Conditions.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log(formData);

    try {
      // 👉 ADDED: send to backend (PostgreSQL)
      const response = await signupUser(formData);

      console.log("Backend Response:", response.data);

      // 👉 ADDED: mark user registered (for login check)
      localStorage.setItem("registered", "true");

      alert("Signup successful!");

      // 👉 redirect to login page
      navigate("/login");

    } catch (error) {
      console.log(error);
      alert("Signup failed (backend issue)");
    }
  };

  return (
    <AuthLayout>

      <h1 className="auth-title">
        Create Account
      </h1>

      <p className="auth-subtitle">
        Join Review and start sharing trusted reviews.
      </p>

      <form onSubmit={handleSubmit}>

        <Input
          label="Full Name"
          placeholder="Enter full name"
          value={formData.fullName}
          onChange={handleChange}
          name="fullName"
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          name="email"
        />

        <Input
          label="Mobile Number"
          placeholder="Enter mobile number"
          value={formData.mobileNumber}
          onChange={handleChange}
          name="mobileNumber"
        />

        <PasswordInput
          label="Password"
          placeholder="Create password"
          value={formData.password}
          onChange={handleChange}
          name="password"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          name="confirmPassword"
        />

        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
          />
          I agree to Terms & Conditions
        </label>

        <Button text="Create Account" type="submit" />

      </form>

      <p className="bottom-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>

    </AuthLayout>
  );
}

export default Signup;