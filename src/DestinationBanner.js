import React from "react";
import DateRangePicker from "./ReactDatePicker";

export default function DestinationBanner({
  searchRef,
  destination,
  handleDestinationChange,
  handleKeyDown,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  handleSuggestionClick,
  setDateRange,
  rgRef,
  rgOpen,
  setRgOpen,
  rooms,
  adults,
  children,
  setRooms,
  setAdults,
  setChildren,
  handleSearch,
  inc,
  dec,
}) {
  return (
    
    <div>
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
                    onMouseDown={(e) => e.preventDefault()}
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
          <DateRangePicker onChange={setDateRange} />
        </div>

        {/* Rooms & Guests Dropdown */}
        <div className="search-field" ref={rgRef}>
          <label>Rooms & Guests:</label>
          <div className="rg-dropdown">
            <button
              className="rg-toggle"
              type="button"
              onClick={() => setRgOpen((o) => !o)}
            >
              Room {rooms}, Guest {adults + children}
            </button>
            {rgOpen && (
              <div className="rg-panel">
                {[
                  { label: "Rooms", value: rooms, set: setRooms, min: 1 },
                  { label: "Adults", value: adults, set: setAdults, min: 1 },
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
                <button className="rg-done" type="button" onClick={() => setRgOpen(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search button */}
        <div className="search-field search-button">
          <button className="search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>
    </div>
  );
}
