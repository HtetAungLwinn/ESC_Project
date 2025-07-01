// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home   from "./Home";
import Login  from "./Login";
import Signup from "./Signup";

export default function App() {
  console.log("👉 Signup import is:", Signup);
  return (
    <Routes>
      <Route path="/"       element={<Home  />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup/>} />
    </Routes>
  );
}
