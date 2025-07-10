import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

const hotels = [
  { name: "Marina Bay Sands", location: "Singapore", price: 500, guestRating: 9.1, starRating: 5 },
  { name: "Orchard Hotel", location: "Singapore", price: 200, guestRating: 8.0, starRating: 4 },
  { name: "Bali Beach Resort", location: "Bali", price: 150, guestRating: 7.5, starRating: 3 },
  { name: "Bangkok Grand", location: "Bangkok", price: 100, guestRating: 6.8, starRating: 2 },
];

export default function Results() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";

  const nights = parseInt(searchParams.get("nights")) || 1;
  const rooms = parseInt(searchParams.get("rooms")) || 1;

  const [sortOrder, setSortOrder] = useState("PriceLowToHigh");
  const [guestRatingFilter, setGuestRatingFilter] = useState(0);
  const [starRatingFilter, setStarRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const filteredAndSortedHotels = hotels
    .filter(
      (hotel) =>
        hotel.location.toLowerCase() === destination.toLowerCase() &&
        hotel.guestRating >= guestRatingFilter &&
        hotel.starRating >= starRatingFilter &&
        hotel.price >= priceRange[0] &&
        hotel.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "PriceLowToHigh":
          return a.price - b.price;
        case "PriceHighToLow":
          return b.price - a.price;
        case "StarLowToHigh":
          return a.starRating - b.starRating;
        case "StarHighToLow":
          return b.starRating - a.starRating;
        case "GuestLowToHigh":
          return a.guestRating - b.guestRating;
        case "GuestHighToLow":
          return b.guestRating - a.guestRating;
        default:
          return 0;
      }
    });

  // HI MODIFY THIS PART TO GO TO HOTEL DETAILS PAGE FOR EACH HOTEL
  const handleSelect = (hotel) => {
    alert(`Selected ${hotel.name} for ${rooms} room(s), ${nights} night(s).`);
    // Here you can add navigation or other logic
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* Header */}
      <div
        className="header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plane size={28} />
          <div className="header-title">OCBC Travel</div>
        </div>
        <div className="header-actions">
          <Link to="/login" className="login-btn" style={{ marginRight: "1rem" }}>
            Login
          </Link>
          <Link to="/signup" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </div>

      <h1>Hotel Search Results</h1>

      {/* Sorting dropdown */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <label htmlFor="filters">Sort By:&nbsp;</label>
        <select
          id="filters"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: "0.25rem", fontSize: "1rem" }}
        >
          <option value="PriceLowToHigh">Price (Lowest to Highest)</option>
          <option value="PriceHighToLow">Price (Highest to Lowest)</option>
          <option value="StarLowToHigh">Star Rating (Lowest to Highest)</option>
          <option value="StarHighToLow">Star Rating (Highest to Lowest)</option>
          <option value="GuestLowToHigh">Guest Rating (Lowest to Highest)</option>
          <option value="GuestHighToLow">Guest Rating (Highest to Highest)</option>
        </select>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
        {/* Filters sidebar */}
        <div style={{ minWidth: "220px", borderRight: "1px solid #ccc", paddingRight: "1rem" }}>
          <h3>Filter Results</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Min Guest Rating:<br />
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={guestRatingFilter}
                onChange={(e) => setGuestRatingFilter(parseFloat(e.target.value) || 0)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Min Star Rating:<br />
              <input
                type="number"
                min="0"
                max="5"
                step="1"
                value={starRatingFilter}
                onChange={(e) => setStarRatingFilter(parseInt(e.target.value) || 0)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Price Range:<br />
              <input
                type="number"
                min="0"
                max="10000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                style={{ width: "48%", marginRight: "4%" }}
              />
              <input
                type="number"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                style={{ width: "48%" }}
              />
            </label>
          </div>
        </div>

        {/* Hotel results list */}
        <div style={{ flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredAndSortedHotels.map((hotel, index) => {
              const totalPrice = hotel.price * nights * rooms;
              return (
                <li
                  key={index}
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "1rem 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2>{hotel.name}</h2>
                    <p>Location: {hotel.location}</p>
                    <p>Guest Rating: {hotel.guestRating}</p>
                    <p>Star Rating: {hotel.starRating}</p>
                  </div>

                  {/* Total price and select button */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      Total Price: ${totalPrice.toLocaleString()}
                      <br />
                      ({rooms} room{rooms > 1 ? "s" : ""}, {nights} night{nights > 1 ? "s" : ""} × ${hotel.price} per night)
                    </div>
                    <button
                      onClick={() => handleSelect(hotel)}
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        cursor: "pointer",
                        borderRadius: "4px",
                        border: "1px solid #007bff",
                        backgroundColor: "#007bff",
                        color: "white",
                      }}
                    >
                      Select
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

}
