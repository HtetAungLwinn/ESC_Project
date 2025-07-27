// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./css/index.css";

import HeaderBanner from "./component/HeaderBanner";
import BottomBar    from "./component/BottomBar";

import Home             from "./Home";
import Login            from "./Login";
import Signup           from "./Signup";
import Results          from "./Results";
import HotelDetailsPage from "./HotelDetailsPage";
import PaymentStripe   from "./PaymentStripe";
import Confirmation     from "./component/Confirmation";
import Test     from "./Test";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("ocbcDarkMode")) || false
  );

  useEffect(() => {
    localStorage.setItem("ocbcDarkMode", JSON.stringify(darkMode));
    document.body.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("bw", darkMode);
  }, [darkMode]);

  return (
    <div className="App">
      <HeaderBanner
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="App__content">
        <Routes>
          <Route
            path="/"
            element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/results" element={<Results />} />
          <Route path="/room" element={<HotelDetailsPage />} />
          <Route path="/payment-stripe" element={<PaymentStripe />} />
          <Route
            path="/confirmation"
            element={<Confirmation />}
          />
          <Route path="/t" element={<Test />} />
        </Routes>
      </main>

      <BottomBar />
    </div>
  );
}
