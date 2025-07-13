import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import Fuse from "fuse.js";
import DateRangePicker from "./ReactDatePicker";
import "./Results.css";

const HOTELS_PER_PAGE = 18;

export default function Results() {
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";
  const uid = searchParams.get("uid") || "";

  const [destinationInput, setDestinationInput] = useState(destination);
  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const searchRef = useRef(null);
  const rgRef = useRef(null);
  const [rgOpen, setRgOpen] = useState(false);

  const fuse = useMemo(
    () => new Fuse(allDestinations, { threshold: 0.3, minMatchCharLength: 2 }),
    [allDestinations]
  );

  useEffect(() => {
    fetch("http://localhost:5000/api/destinations/all")
      .then(res => res.json())
      .then(data => {
        const list = data.map(d => (typeof d === "string" ? d : d.destination)).filter(Boolean);
        setAllDestinations(list);
      });
  }, []);

  const handleDestinationChange = (e) => {
    const v = e.target.value;
    setDestinationInput(v);
    if (v.length > 1) {
      const results = fuse.search(v).slice(0, 8).map(r => r.item);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s) => {
    setDestinationInput(s);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length) {
        setDestinationInput(suggestions[0]);
        setShowSuggestions(false);
      }
      handleSearch();
    }
  };

  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const inc = (fn, max) => () => fn((v) => Math.min(v + 1, max));
  const dec = (fn, min) => () => fn((v) => Math.max(v - 1, min));

  const handleSearch = () => {
    if (!destinationInput.trim()) return;

    fetch(`http://localhost:5000/api/destinations/uid?term=${encodeURIComponent(destinationInput)}`)
      .then(res => res.json())
      .then(data => {
        const uid = data.uid;
        const nights = getNights();

        navigate(
          `/results?destination=${encodeURIComponent(destinationInput)}` +
          `&uid=${encodeURIComponent(uid)}` +
          `&nights=${nights}` +
          `&rooms=${rooms}` +
          `&adults=${adults}` +
          `&children=${children}`
        );
      });
  };

  useEffect(() => {
    const fetchHotels = async () => {
      if (!uid) return;

      try {
        const hotelRes = await fetch(`/api/hotels?destination_id=${uid}`);
        if (!hotelRes.ok) throw new Error("Failed to fetch hotels");

        const hotelData = await hotelRes.json();
        console.log("Fetched hotels data:", hotelData);

        const formattedHotels = hotelData.map((h) => ({
          id: h.id || Math.random().toString(36).substr(2, 9),
          name: h.name,
          price: h.price || 100,
          imageUrl:
            h.image_details && h.image_details.prefix && h.image_details.suffix
              ? `${h.image_details.prefix}${h.default_image_index ?? 0}${h.image_details.suffix}`
              : null,
        }));

        setHotels(formattedHotels);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setHotels([]);
      }
    };

    fetchHotels();
  }, [uid]);

  const totalPages = Math.ceil(hotels.length / HOTELS_PER_PAGE);

  const hotelsToShow = hotels.slice(
    (currentPage - 1) * HOTELS_PER_PAGE,
    currentPage * HOTELS_PER_PAGE
  );

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
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

      {/* Search card */}
      <div className="search-box">
        {/* Destination */}
        <div className="search-field" ref={searchRef}>
          <label>Destination:</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Where are you going?"
              value={destinationInput}
              onChange={handleDestinationChange}
              onKeyDown={handleKeyDown}
              onFocus={() => destinationInput.length > 1 && setShowSuggestions(true)}
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((s, i) => (
                  <li key={i} onMouseDown={(e) => e.preventDefault()} onClick={() => handleSuggestionClick(s)}>
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
          <DateRangePicker onChange={setDateRange} />
        </div>

        {/* Rooms & Guests Dropdown */}
        <div className="search-field" ref={rgRef}>
          <label>Rooms & Guests:</label>
          <div className="rg-dropdown">
            <button className="rg-toggle" type="button" onClick={() => setRgOpen(o => !o)}>
              Room {rooms}, Guest {adults + children}
            </button>
            {rgOpen && (
              <div className="rg-panel">
                <div className="rg-row">
                  <span>Rooms</span>
                  <div className="rg-controls">
                    <button onClick={dec(setRooms, 1)}>-</button>
                    <span>{rooms}</span>
                    <button onClick={inc(setRooms, 10)}>+</button>
                  </div>
                </div>
                <div className="rg-row">
                  <span>Adults</span>
                  <div className="rg-controls">
                    <button onClick={dec(setAdults, 1)}>-</button>
                    <span>{adults}</span>
                    <button onClick={inc(setAdults, 10)}>+</button>
                  </div>
                </div>
                <div className="rg-row">
                  <span>Children</span>
                  <div className="rg-controls">
                    <button onClick={dec(setChildren, 0)}>-</button>
                    <span>{children}</span>
                    <button onClick={inc(setChildren, 10)}>+</button>
                  </div>
                </div>
                <button className="rg-done" type="button" onClick={() => setRgOpen(false)}>Done</button>
              </div>
            )}
          </div>
        </div>

        {/* Search button */}
        <div className="search-field search-button">
          <button className="search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>

      <h1 style={{ marginBottom: "1rem", marginLeft: "2rem" }}>Hotels in {destination}</h1>

      <div style={{ display: "flex", gap: "2rem", marginLeft: "2rem" }}>
        {/* Left: Hotels grid */}
        <div style={{
          flex: 3,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "minmax(280px, auto)",
          gap: "1rem",
        }}>
          {hotelsToShow.length === 0 ? (
            <p>No hotels available for this destination.</p>
          ) : (
            hotelsToShow.map((hotel) => (
              <div
                key={hotel.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                }}
                onClick={() => alert(`Go to details page for ${hotel.name}`)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {hotel.imageUrl ? (
                  <img src={hotel.imageUrl} alt={hotel.name} style={{ width: "100%", height: "180px", objectFit: "cover" }} loading="lazy" />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "180px",
                    backgroundColor: "#ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}>No Image</div>
                )}
                <div style={{ padding: "0.5rem 1rem", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={hotel.name}>
                    {hotel.name}
                  </h3>
                  <p style={{ fontWeight: "bold", fontSize: "1rem", margin: 0, color: "#007bff" }}>
                    ${hotel.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Placeholder */}
        <div style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
          height: "calc(6 * 280px + 5 * 1rem)",
          overflow: "hidden",
        }}>
          <img src="https://via.placeholder.com/400x1700?text=Map+Placeholder" alt="Map Placeholder" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Prev button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "0.4rem 0.8rem",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>

          {/* Dynamic sliding pagination */}
          {(() => {
            const visiblePages = 3;
            let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
            let endPage = startPage + visiblePages - 1;

            if (endPage > totalPages) {
              endPage = totalPages;
              startPage = Math.max(1, endPage - visiblePages + 1);
            }

            const pageButtons = [];

            for (let i = startPage; i <= endPage; i++) {
              pageButtons.push(
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    fontWeight: currentPage === i ? "bold" : "normal",
                    textDecoration: currentPage === i ? "underline" : "none",
                    cursor: "pointer",
                  }}
                >
                  {i}
                </button>
              );
            }

            // Show first page and ellipsis if startPage > 1
            if (startPage > 1) {
              pageButtons.unshift(
                <button key={1} onClick={() => goToPage(1)} style={{ padding: "0.4rem 0.8rem" }}>
                  1
                </button>,
                <span key="start-ellipsis" style={{ padding: "0.4rem 0.8rem" }}>...</span>
              );
            }

            // Show ellipsis and last page if endPage < totalPages
            if (endPage < totalPages) {
              pageButtons.push(
                <span key="end-ellipsis" style={{ padding: "0.4rem 0.8rem" }}>...</span>,
                <button key={totalPages} onClick={() => goToPage(totalPages)} style={{ padding: "0.4rem 0.8rem" }}>
                  {totalPages}
                </button>
              );
            }

            return pageButtons;
          })()}

          {/* Next button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.4rem 0.8rem",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
