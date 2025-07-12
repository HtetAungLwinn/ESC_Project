import React, { useState, useEffect } from "react";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      // Log in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        return;
      }

      // Retrieve user info from localStorage
      const firstName = localStorage.getItem("firstName") || "Unknown";
      const lastName = localStorage.getItem("lastName") || "Unknown";
      const salutation = localStorage.getItem("salutation") || "Unknown";
      const phoneNumber = localStorage.getItem("phoneNumber") || "Unknown";
      const address = localStorage.getItem("address") || "Unknown";
      const postalCode = localStorage.getItem("postalCode") || "Unknown";
      const roles = localStorage.getItem("roles") || "Unknown";

      // Send user info to backend to store in MySQL
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          firstName,
          lastName,
          salutation,
          phoneNumber,
          address,
          postalCode,
          email,
          password,
          roles,
        }),
      });

      const data = await response.json();

      if (data.success || response.status === 409) {
        setSuccessMessage("Login successful!");
        setUserInfo({ uid: user.uid, email, firstName, lastName, salutation, phoneNumber, address, postalCode, roles });
      } else {
        setErrorMessage("Login succeeded, but saving to database failed.");
      }

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="centered">
      <div className="hotel-page">
      {/* Header with icon, title, and auth links */}
      <div className="header">
      <div className="header-left">
          <Plane size={28} />
          <Link to="/" className="header-title">OCBC Travel</Link>
        </div>
        <div className="header-actions">
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </div>
      </div>
      <h2 style={{ padding: "50px" }}>Login</h2>
      <div className="login-card">
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="login-form-container">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>
        </div>
        <div className="submit-btn-container">
          <button type="submit">Log In</button>
        </div>
      </form>
    </div>
    </div>
  );
}
