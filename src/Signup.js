import React from "react";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

export default function Signup() {
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
      <form>
        <h3 className="section-header">1. Identification details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="salutation">Salutation:</label>
            <select id="salutation" name="salutation">
            <option value="">Select</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
          </select>

          </div>
          <div className="input-group">
            <label htmlFor="fname">First name:</label>
            <input type="text" id="fname" name="fname" />
          </div>
          <div className="input-group">
            <label htmlFor="lname">Last name:</label>
            <input type="text" id="lname" name="lname" />
          </div>
        </div>

        <h3 className="section-header">2. Contact details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="contact">Phone contact:</label>
            <input type="text" id="contact" name="contact" />
          </div>
          <div className="input-group">
            <label>Billing Address:</label>
            <div className="address-box">
              <div className="input-group">
                <label htmlFor="fulladdress">Address details</label>
                <input type="text" id="fulladdress" name="fulladdress" />
              </div>
              <div className="input-group">
                <label htmlFor="postal">Postal Code</label>
                <input type="text" id="postal" name="postal" />
              </div>
            </div>
          </div>



        </div>

        <h3 className="section-header">3. Login details</h3>
        <div className="flex-container">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
          </div>
          <div className="input-group">
            <label htmlFor="confirm">Confirm Password:</label>
            <input type="password" id="confirm" name="confirm" />
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
