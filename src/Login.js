import React from "react";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";


export default function Login() {
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
      <form>
        <div className="login-form-container">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
          </div>
        </div>
        <div className="submit-btn-container">
          <button type="submit">Log In</button>
        </div>
      </form>
    </div>
  );
}
