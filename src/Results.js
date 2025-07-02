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

  //other filters
  const [guestRatingFilter, setGuestRatingFilter] = useState(0);
  const [starRatingFilter, setStarRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const filteredHotels = hotels.filter(hotel => {
    return (
      hotel.location.toLowerCase() === destination.toLowerCase() &&  // filter by location
      hotel.guestRating >= guestRatingFilter &&
      hotel.starRating >= starRatingFilter &&
      hotel.price >= priceRange[0] &&
      hotel.price <= priceRange[1]
    );
  });

  return (
    <div>
      {/* Header with icon, title, and auth links */}
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

      {/* Filters */}
      <div>
        <label>
          Min Guest Rating:
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={guestRatingFilter}
            onChange={e => setGuestRatingFilter(parseFloat(e.target.value) || 0)}
          />
        </label>

        <label>
          Min Star Rating:
          <input
            type="number"
            min="0"
            max="5"
            step="1"
            value={starRatingFilter}
            onChange={e => setStarRatingFilter(parseInt(e.target.value) || 0)}
          />
        </label>

        <label>
          Price Range:
          <input
            type="number"
            min="0"
            max="10000"
            step="1"
            value={priceRange[0]}
            onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
          />
          to
          <input
            type="number"
            min="0"
            max="10000"
            step="1"
            value={priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
          />
        </label>
      </div>

      {/* Display filtered hotels */}
      <ul>
        {filteredHotels.map((hotel, index) => (
          <li key={index}>
            <h2>{hotel.name}</h2>
            <p>Location: {hotel.location}</p>
            <p>Price: ${hotel.price}</p>
            <p>Guest Rating: {hotel.guestRating}</p>
            <p>Star Rating: {hotel.starRating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
