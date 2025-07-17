// src/HeaderBanner.js
import React from "react";
import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export default function HeaderBanner({ loggedIn, setLoggedIn }) {
  return (
    <div className="header">
      {/* left side: only the icon+text is a link */}
      <div className="header-left">
       <Link to="/" className="header-title">
         <Plane size={28} style={{ marginRight: 8 }} />
         OCBC Travel
       </Link>
     </div>

      {/* right side: your Login/Signup or Booking/Logout */}
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
