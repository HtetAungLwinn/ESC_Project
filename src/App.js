// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home   from "./Home";
import Login  from "./Login";
import Signup from "./Signup";
import Results from "./Results";



export default function App() {
  console.log("👉 Signup import is:", Signup);
  console.log("👉 Results import is:", Results);

  return (
    <Routes>
      <Route path="/"       element={<Home  />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}
