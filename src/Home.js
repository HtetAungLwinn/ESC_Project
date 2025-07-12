// src/Home.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import DateRangePicker from "./ReactDatePicker";
import NumberSelector from "./NumberSelector";
import { Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import "./Home.css";

export default function Home() {
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Load destinations
  useEffect(() => {
    fetch("/api/destinations/all")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        const cleaned = data.map(d => typeof d === "string" ? d : d.destination).filter(Boolean);
        setAllDestinations(cleaned);
      })
      .catch((err) => console.error("Error loading destinations:", err));
    // setAllDestinations(["Paris", "London", "Tokyo", "New York", "Singapore"]);
  }, []);

  // Configure Fuse.js
  const fuse = useMemo(() => new Fuse(allDestinations, {
    threshold: 0.3,
    minMatchCharLength: 2,
  }), [allDestinations]);

  // Destination input change
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.length > 1) {
      const results = fuse.search(value).slice(0, 5); // Limit to 5 matches
      setSuggestions(results.map(r => r.item));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (suggestions.length > 0 && showSuggestions) {
        setDestination(suggestions[0]);
        setShowSuggestions(false);
      }
      handleSearch();
    }
  };

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
        {/* Destination field */}
        <div className="search-field" ref={searchRef}>
          <label htmlFor="Destination">Destination:</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              id="Destination"
              placeholder="Where are you going?"
              value={destination}
              onChange={handleDestinationChange}
              onKeyDown={handleKeyDown}
              onFocus={() => destination.length > 1 && setShowSuggestions(true)}
              autoComplete="off"
              style={{ width: "100%", padding: "10px" }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
