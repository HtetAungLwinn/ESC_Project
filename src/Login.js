// src/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ setLoggedIn }) {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [errorMessage, setErrorMessage]   = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userInfo, setUserInfo]     = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        return;
      }

      // pull info from localStorage…
      const firstName   = localStorage.getItem("firstName")   || "Unknown";
      const lastName    = localStorage.getItem("lastName")    || "Unknown";
      const salutation  = localStorage.getItem("salutation")  || "Unknown";
      const phoneNumber = localStorage.getItem("phoneNumber") || "Unknown";
      const address     = localStorage.getItem("address")     || "Unknown";
      const postalCode  = localStorage.getItem("postalCode")  || "Unknown";
      const roles       = localStorage.getItem("roles")       || "Unknown";

      // send to your backend…
      const response = await fetch("/api/signup", {
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
        setLoggedIn(true);     // update global state
        navigate("/");         // ← redirect to homepage
      } else {
        setErrorMessage("Login succeeded, but saving to database failed.");
      }

    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="centered">
      <h2 style={{ padding: "50px" }}>Login</h2>
      <div className="login-card">
        {errorMessage   && <p style={{ color: "red" }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="login-form-container">
            <div className="input-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
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
