// src/HeaderBanner.js
import React from "react";
import { Link } from "react-router-dom";
import { Plane, Moon, Sun } from "lucide-react";

export default function HeaderBanner({
  loggedIn,
  setLoggedIn,
  darkMode,
  setDarkMode,
}) {
  return (
    <div className="header">
      <div className="header-left">
        <Link to="/" className="header-title">
          <Plane size={28} style={{ marginRight: 8 }} />
          OCBC Travel
        </Link>
      </div>

      <div className="header-actions">
        {/* Dark mode toggle */}
        <button
          aria-label="Toggle dark mode"
          className="dark-toggle-btn"
          onClick={() => setDarkMode((m) => !m)}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {loggedIn ? (
          <>
            <Link to="/booking" className="login-btn">
              Booking Details
            </Link>
            <Link
              to="/"
              className="signup-btn"
              onClick={() => setLoggedIn(false)}
            >
              Log Out
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
