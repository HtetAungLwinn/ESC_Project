import React from "react";

export default function Signup() {
  return (
    <div className="centered">
      <h2 style={{ padding: "50px" }}>Sign Up</h2>
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
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
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
            <label htmlFor="contact">Contact:</label>
            <input type="text" id="contact" name="contact" />
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
  );
}
