import React from "react";

export default function Signup() {
  return (
    <div className="auth-page">
      <h2>Sign Up</h2>
      <form>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />

        <label htmlFor="confirm">Confirm Password</label>
        <input type="password" id="confirm" name="confirm" />

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}
