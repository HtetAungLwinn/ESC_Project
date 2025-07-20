import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Results from "./Results";
import HotelDetailsPage from "./HotelDetailsPage";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import HeaderBanner from "./HeaderBanner";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      <HeaderBanner loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/results" element={<Results />} />
        <Route path="/room" element={<HotelDetailsPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </>
  );
}
