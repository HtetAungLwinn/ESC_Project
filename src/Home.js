// src/Home.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import Fuse from "fuse.js";
import DestinationBanner from "./DestinationBanner";
// inlined Rooms & Guests dropdown; no separate component

export default function Home() {
  const [destination, setDestination] = useState("");
  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [rooms, setRooms]       = useState(1);
  const [adults, setAdults]     = useState(1);
  const [children, setChildren] = useState(0);

  // Dropdown open state and ref
  const [rgOpen, setRgOpen] = useState(false);
  const rgRef = useRef(null);

  const navigate = useNavigate();

  // Close room/guest dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (rgRef.current && !rgRef.current.contains(e.target)) {
        setRgOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch destinations
  useEffect(() => {
    fetch("http://localhost:5000/api/destinations/all")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        const list = data.map(d => (typeof d === "string" ? d : d.destination)).filter(Boolean);
        setAllDestinations(list);
      })
      .catch(console.error);
  }, []);


  const fuse = useMemo(
    () => new Fuse(allDestinations, { threshold: 0.3, minMatchCharLength: 2 }),
    [allDestinations]
  );

  // Handlers
  const handleDestinationChange = e => {
    const v = e.target.value;
    setDestination(v);
    if (v.length > 1) {
      setSuggestions(fuse.search(v).slice(0, 8).map(r => r.item));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  const handleSuggestionClick = s => { setDestination(s); setShowSuggestions(false); };
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length) {
        setDestination(suggestions[0]);
        setShowSuggestions(false);
      }
      handleSearch();
    }
  };

  // Night difference
  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Increment/Decrement helpers
  const inc = (fn, max) => () => fn(v => Math.min(v + 1, max));
  const dec = (fn, min) => () => fn(v => Math.max(v - 1, min));

  // Search
  const handleSearch = () => {
    if (!destination.trim()) return;

    fetch(`http://localhost:5000/api/destinations/uid?term=${encodeURIComponent(destination)}`)
      .then(res => res.json())
      .then(data => {
        const uid = data.uid;
        const nights = getNights();

        const checkin = dateRange.startDate?.toISOString().split("T")[0];
        const checkout = dateRange.endDate?.toISOString().split("T")[0];

        navigate(
          `/results?destination=${encodeURIComponent(destination)}` +
          `&uid=${encodeURIComponent(uid)}` +
          `&checkin=${checkin}` +
          `&checkout=${checkout}` +
          `&nights=${nights}` +
          `&rooms=${rooms}` +
          `&adults=${adults}` +
          `&children=${children}`
        );
      });
  };

  return (
    <div>

      {/* Header */}
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

      {/* Banner */}
      <div className="img">
        <img src={process.env.PUBLIC_URL + "/photos/headliner.jpg"} alt="Banner" />
      </div>

      {/* Title */}
      <h1 className="centered">Travel Website</h1>
      <p className="subheading">
        Discover amazing hotels, compare prices, and book your ideal
        accommodation for your next adventure.
      </p>

          {/* Search card */}
          <DestinationBanner
          searchRef={searchRef}
          destination={destination}
          handleDestinationChange={handleDestinationChange}
          handleKeyDown={handleKeyDown}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          setDateRange={setDateRange}
          rgRef={rgRef}
          rgOpen={rgOpen}
          setRgOpen={setRgOpen}
          rooms={rooms}
          adults={adults}
          children={children}
          setRooms={setRooms}
          setAdults={setAdults}
          setChildren={setChildren}
          handleSearch={handleSearch}
          inc={inc}
          dec={dec}
        />
    </div>
  );
}
