// src/component/SearchBanner.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import DateRangePicker from "./ReactDatePicker";

export default function SearchBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);


  const minCheckinDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3);
    return d;
  }, []);


  const rawDest     = qs.get("destination") || "";
  const rawCheckin  = qs.get("checkin");
  const parsedStart = rawCheckin ? new Date(rawCheckin) : null;
  const initialStart = parsedStart && parsedStart < minCheckinDate
    ? minCheckinDate
    : parsedStart;

  const rawCheckout = qs.get("checkout");
  const initialEnd  = rawCheckout ? new Date(rawCheckout) : null;

  const initialRooms    = parseInt(qs.get("rooms")    || "1", 10);
  const initialAdults   = parseInt(qs.get("adults")   || "1", 10);
  const initialChildren = parseInt(qs.get("children") || "0", 10);


  const [destination, setDestination] = useState(rawDest);
  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [dateRange, setDateRange] = useState({
    startDate: initialStart,
    endDate:   initialEnd,
  });

  const minCheckoutDate = useMemo(() => {
    if (!dateRange.startDate) return null;
    const d = new Date(dateRange.startDate);
    d.setDate(d.getDate() + 1);
    return d;
  }, [dateRange.startDate]);

  const [rooms, setRooms]       = useState(initialRooms);
  const [adults, setAdults]     = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const [rgOpen, setRgOpen] = useState(false);
  const rgRef               = useRef(null);


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


  const fuse = useMemo(
    () => new Fuse(allDestinations, { threshold: 0.3, minMatchCharLength: 2 }),
    [allDestinations]
  );


  useEffect(() => {
    const handler = e => {
      if (rgRef.current && !rgRef.current.contains(e.target)) {
        setRgOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


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


  const handleDateRangeChange = ({ startDate, endDate }) => {
    if (startDate && startDate < minCheckinDate) {
      startDate = minCheckinDate;
    }
    if (endDate && startDate && endDate <= startDate) {
      endDate = null;
    }
    setDateRange({ startDate, endDate });
  };

  const inc = fn => () => fn(v => v + 1);
  const dec = (fn, min) => () => fn(v => Math.max(v - 1, min));


  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate - startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };


  const handleSearch = () => {
    let dest = destination.trim();
    if (!dest) return;
    // If destination is not an exact match, try to auto-complete
    const exactMatch = allDestinations.find(
      d => d.toLowerCase() === dest.toLowerCase()
    );
    if (!exactMatch) {
      const hits = fuse.search(dest).slice(0, 1); // take top suggestion
      if (hits.length > 0) {
        dest = hits[0].item; // auto-complete with suggestion
        setDestination(dest); // update input field
      }
    }

    const { startDate } = dateRange;
    if (startDate && startDate < minCheckinDate) {
      alert(`Check‑in must be on or after ${minCheckinDate.toLocaleDateString("en-CA")}`);
      return;
    }

    fetch(`/api/destinations/uid?term=${encodeURIComponent(dest)}`)
      .then(res => res.json())
      .then(data => {
        const uid    = data.uid;
        const nights = getNights();
        const checkin  = dateRange.startDate
          ? dateRange.startDate.toLocaleDateString("en-CA")
          : "";
        const checkout = dateRange.endDate
          ? dateRange.endDate.toLocaleDateString("en-CA")
          : "";

        navigate(
          `/results?destination=${encodeURIComponent(dest)}`+
          `&uid=${encodeURIComponent(uid)}`+
          `&checkin=${checkin}`+
          `&checkout=${checkout}`+
          `&nights=${nights}`+
          `&rooms=${rooms}`+
          `&adults=${adults}`+
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
          onChange={handleDateRangeChange}
          minDate={minCheckinDate}
          minCheckoutDate={minCheckoutDate}
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
                    <button onClick={inc(set)}>+</button>
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

      {/* Search */}
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
