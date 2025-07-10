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

  // filter by location
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";
  const [sortOrder, setSortOrder] = useState("PriceLowToHigh");


  //other filters
  const [guestRatingFilter, setGuestRatingFilter] = useState(0);
  const [starRatingFilter, setStarRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const filteredAndSortedHotels = hotels
  .filter(hotel =>
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


  return (
  <div>
    {/* Header */}
    <div className="header">
      <div className="header-left">
        <Plane size={28} />
        <div className="header-title">OCBC Travel</div>
      </div>
      <div className="header-actions">
        <Link to="/login" className="login-btn">Login</Link>
        <Link to="/signup" className="signup-btn">Sign Up</Link>
      </div>
    </div>

    <h1>Hotel Search Results</h1>

    {/* Sorting Dropdown (stays at the top) */}
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor="filters">Sort By:&nbsp;</label>
      <select
        id="filters"
        value={sortOrder}
        onChange={e => setSortOrder(e.target.value)}
      >
        <option value="PriceLowToHigh">Price (Lowest to Highest)</option>
        <option value="PriceHighToLow">Price (Highest to Lowest)</option>
        <option value="StarLowToHigh">Star Rating (Lowest to Highest)</option>
        <option value="StarHighToLow">Star Rating (Highest to Lowest)</option>
        <option value="GuestLowToHigh">Guest Rating (Lowest to Highest)</option>
        <option value="GuestHighToLow">Guest Rating (Highest to Lowest)</option>
      </select>
    </div>

    {/* Main layout: Filters on left, Results on right */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
      
      {/* Sidebar filters */}
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
              onChange={e => setGuestRatingFilter(parseFloat(e.target.value) || 0)}
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
              onChange={e => setStarRatingFilter(parseInt(e.target.value) || 0)}
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
              onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              style={{ width: "48%", marginRight: "4%" }}
            />
            <input
              type="number"
              min="0"
              max="10000"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
              style={{ width: "48%" }}
            />
          </label>
        </div>
      </div>

      {/* Hotel results list */}
      <div style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredAndSortedHotels.map((hotel, index) => (
            <li key={index} style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}>
              <h2>{hotel.name}</h2>
              <p>Location: {hotel.location}</p>
              <p>Price: ${hotel.price}</p>
              <p>Guest Rating: {hotel.guestRating}</p>
              <p>Star Rating: {hotel.starRating}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);


}
