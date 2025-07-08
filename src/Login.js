import React from "react";

export default function Login() {
  return (
    <div className="centered">
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
