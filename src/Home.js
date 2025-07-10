// src/Home.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DateRangePicker from "./ReactDatePicker";
import NumberSelector from "./NumberSelector";
import { Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();


  const handleSearch = () => {
  if (destination.trim() !== "") {
    const nights = getNights();
    navigate(
      `/results?destination=${encodeURIComponent(destination)}&nights=${nights}&rooms=${rooms}`
    );
  }
};


  // Calculate nights difference helper
  const getNights = () => {
    if (!dateRange.startDate || !dateRange.endDate) return 0;
    const diffTime = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [rooms, setRooms] = useState(1);


  return (
    <div>
      {/* Header with icon, title, and auth links */}
      <div className="header">
        <div className="header-left">
          <Plane size={28} />
          <Link to="/" className="header-title">OCBC Travel</Link>
        </div>
        <div className="header-actions">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </div>

      {/* Banner image */}
      <div className="img">
        <img
          src={process.env.PUBLIC_URL + "/photos/headliner.jpg"}
          alt="Banner"
        />
      </div>

      {/* Main title and subtitle */}
      <h1 className="centered">Travel Website</h1>
      <p className="subheading">
        Discover amazing hotels, compare prices, and book your ideal
        accommodation for your next adventure.
      </p>

      {/* Search box */}
      <div className="search-box">
        {/* Destination field */}
        <div className="search-field">
          <label htmlFor="Destination">Destination:</label>
          <input
            type="text"
            id="Destination"
            placeholder="Where are you going?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Stay Period */}
        <div className="search-field">
          <label>Stay Period:</label>
          <DateRangePicker onChange={setDateRange} />
        </div>

        {/* Guests */}
        <div className="search-field">
          <label htmlFor="numberOfGuest">No. of Guests:</label>
          <NumberSelector id="numberOfGuest" label="" min={1} max={5} />
        </div>

        {/* Rooms */}
        <div className="search-field">
          <label htmlFor="numberOfRoom">No. of Rooms:</label>
          <NumberSelector id="numberOfRoom" label="" min={1} max={5} />
        </div>

        {/* Search button */}
        <div className="search-field">
            <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
