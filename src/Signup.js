import React, { useState, useEffect } from "react";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase";

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    salutation: "",
    phoneNumber: "",
    address: "",
    postalCode: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "1",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    const isPhoneNumberValid = /^\d+$/.test(form.phoneNumber);
    const isPostalCodeValid = /^\d+$/.test(form.postalCode);
    if (!isPhoneNumberValid && !isPostalCodeValid) {
      setErrorMessage("Phone Number and Postal Code must contain digits only");
      return;
    }
    if (!isPhoneNumberValid) {
      setErrorMessage("Phone Number must contain digits only");
      return;
    }
    if (!isPostalCodeValid) {
      setErrorMessage("Postal Code must contain digits only");
      return;
    }
    if (form.password != form.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setErrorMessage("");

    try {
      // Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Send Email Verification
      await sendEmailVerification(user);
      // Use a local storage to store the user info first, then when login, will save into MySQL
      localStorage.setItem("firstName", form.firstName);
      localStorage.setItem("lastName", form.lastName);
      localStorage.setItem("salutation", form.salutation);
      localStorage.setItem("phoneNumber", form.phoneNumber);
      localStorage.setItem("address", form.address);
      localStorage.setItem("postalCode", form.postalCode);
      localStorage.setItem("roles", form.roles);
      setSuccessMessage(
        "Signup successful! A verification email has been sent. Please check your inbox and verify your email before logging in."
      );
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="centered">
      <div className="hotel-page">
    {/* Header with icon, title, and auth links */}
    <div className="header">
         <div className="header-left">
          <Plane size={28} />
          <Link to="/" className="header-title">OCBC Travel</Link>
        </div>
    </div>
    </div>
    
    <div className="centered">
      <h2 style={{ padding: "20px" }}>Sign Up</h2>
      <div className="signup-card">
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <h3 className="section-header">1. Identification details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="salutation">Salutation:</label>
            <select id="salutation" name="salutation" value={form.salutation} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
          </select>

          </div>
          <div className="input-group">
            <label htmlFor="firstName">First name:</label>
            <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Last name:</label>
            <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required/>
          </div>
        </div>

        <h3 className="section-header">2. Contact details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="phoneNumber">Phone contact:</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <label>Billing Address:</label>
            <div className="address-box">
              <div className="input-group">
                <label htmlFor="address">Address details</label>
                <input type="text" id="address" name="address" value={form.address} onChange={handleChange} required/>
              </div>
              <div className="input-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input type="text" id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} required/>
              </div>
            </div>
          </div>
        </div>

        <h3 className="section-header">3. Login details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required/>
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required/>
          </div>
        </div>

        <div className="submit-btn-container">
          <button type="submit">Create Account</button>
        </div>
      </form>
    </div>
    </div>
    </div>
  );
}
