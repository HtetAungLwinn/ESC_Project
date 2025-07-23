// src/SearchBanner.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import DateRangePicker from "./ReactDatePicker";

export default function SearchBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const qs       = new URLSearchParams(location.search);

  // Initialize from URL or fall back to defaults
  const initialDestination = qs.get("destination") || "";
  const initialCheckin     = qs.get("checkin");
  const initialCheckout    = qs.get("checkout");
  const initialRooms       = parseInt(qs.get("rooms")    || "1", 10);
  const initialAdults      = parseInt(qs.get("adults")   || "1", 10);
  const initialChildren    = parseInt(qs.get("children") || "0", 10);

  const [destination, setDestination] = useState(initialDestination);
  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [dateRange, setDateRange] = useState({
    startDate: initialCheckin  ? new Date(initialCheckin)  : null,
    endDate:   initialCheckout ? new Date(initialCheckout) : null
  });

  const [rooms, setRooms]       = useState(initialRooms);
  const [adults, setAdults]     = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const [rgOpen, setRgOpen] = useState(false);
  const rgRef               = useRef(null);

  // Fetch destinations once
  useEffect(() => {
    fetch("/api/destinations/all")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        const list = data
          .map(d => (typeof d === "string" ? d : d.destination))
          .filter(Boolean);
        setAllDestinations(list);
      })
      .catch(console.error);
  }, []);

  // Fuse index for autocomplete
  const fuse = useMemo(
    () => new Fuse(allDestinations, { threshold: 0.3, minMatchCharLength: 2 }),
    [allDestinations]
  );

  // Close guest dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (rgRef.current && !rgRef.current.contains(e.target)) {
        setRgOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete handlers
  const handleDestinationChange = e => {
    const v = e.target.value;
    setDestination(v);
    if (v.length > 1) {
      const hits = fuse.search(v).slice(0, 8).map(r => r.item);
      setSuggestions(hits);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  const handleSuggestionClick = s => {
    setDestination(s);
    setShowSuggestions(false);
  };
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length) {
        setDestination(suggestions[0]);
        setShowSuggestions(false);
      }
      handleSearch();
    }
  };

  // Helpers for guest counts
  const inc = (fn, max) => () => fn(v => Math.min(v + 1, max));
  const dec = (fn, min) => () => fn(v => Math.max(v - 1, min));

  // Compute nights
  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Perform the search
  const handleSearch = () => {
    if (!destination.trim()) return;
    fetch(`/api/destinations/uid?term=${encodeURIComponent(destination)}`)
      .then(res => res.json())
      .then(data => {
        const uid    = data.uid;
        const nights = getNights();

        // Format in local (Singapore) time as YYYY-MM-DD
        const checkin  = dateRange.startDate
          ? dateRange.startDate.toLocaleDateString("en-CA")
          : "";
        const checkout = dateRange.endDate
          ? dateRange.endDate.toLocaleDateString("en-CA")
          : "";

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
      })
      .catch(console.error);
  };

  return (
    <div className="search-box">
      {/* Destination */}
      <div className="search-field" ref={searchRef}>
        <label>Destination:</label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Where are you going?"
            value={destination}
            onChange={handleDestinationChange}
            onKeyDown={handleKeyDown}
            onFocus={() => destination.length > 1 && setShowSuggestions(true)}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stay Period */}
      <div className="search-field">
        <label>Stay Period:</label>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      {/* Rooms & Guests */}
      <div className="search-field" ref={rgRef}>
        <label>Rooms & Guests:</label>
        <div className="rg-dropdown">
          <button
            className="rg-toggle"
            type="button"
            onClick={() => setRgOpen(o => !o)}
          >
            Room {rooms}, Guest {adults + children}
          </button>
          {rgOpen && (
            <div className="rg-panel">
              {[
                { label: "Rooms",    value: rooms,    set: setRooms,    min: 1 },
                { label: "Adults",   value: adults,   set: setAdults,   min: 1 },
                { label: "Children", value: children, set: setChildren, min: 0 },
              ].map(({ label, value, set, min }) => (
                <div className="rg-row" key={label}>
                  <span>{label}</span>
                  <div className="rg-controls">
                    <button onClick={dec(set, min)}>-</button>
                    <span>{value}</span>
                    <button onClick={inc(set, 10)}>+</button>
                  </div>
                </div>
              ))}
              <button
                className="rg-done"
                type="button"
                onClick={() => setRgOpen(false)}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <div className="search-field search-button">
        <button
          type="button"
          className="search-btn"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}
