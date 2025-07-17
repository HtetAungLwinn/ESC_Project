// HeaderBanner.js
import React from "react";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export default function HeaderBanner({ loggedIn, setLoggedIn }) {
  return (
    <div className="header">
      <div className="header-left">
        <Plane size={28} />
        <Link to="/" className="header-title">OCBC Travel</Link>
      </div>
      <div className="header-actions">
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
