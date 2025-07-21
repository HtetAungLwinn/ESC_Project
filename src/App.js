// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import "./index.css";                // your global styles

import HeaderBanner from "./HeaderBanner";
import BottomBar    from "./BottomBar";

import Home             from "./Home";
import Login            from "./Login";
import Signup           from "./Signup";
import Results          from "./Results";
import HotelDetailsPage from "./HotelDetailsPage";
import Payment          from "./Payment";
import Confirmation     from "./Confirmation";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="App">
      <HeaderBanner loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <main className="App__content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
              />
            }
          />
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/results" element={<Results />} />
          <Route path="/room" element={<HotelDetailsPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route
            path="/confirmation"
            element={<Confirmation />}
          />
        </Routes>
      </main>

      <BottomBar />
    </div>
  );
}
