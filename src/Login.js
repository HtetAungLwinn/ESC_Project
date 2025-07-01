import React from "react";

export default function Login() {
  return (
    <div className="auth-page">
      <h2>Login</h2>
      <form>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" />
        
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" />
        
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
