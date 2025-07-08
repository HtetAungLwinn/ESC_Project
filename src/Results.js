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

  /*
  const filteredHotels = hotels.filter(hotel => {
    return (
      hotel.location.toLowerCase() === destination.toLowerCase() &&  // filter by location
      hotel.guestRating >= guestRatingFilter &&
      hotel.starRating >= starRatingFilter &&
      hotel.price >= priceRange[0] &&
      hotel.price <= priceRange[1]
    );
  });
  */


  const sortedHotels = hotels
    .filter(hotel => hotel.location.toLowerCase() === destination.toLowerCase())
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

      {/* Sorting Dropdown */}
      <label htmlFor="filters">Sort By:</label>
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


      {/* Hotel Results */}
      <ul>
        {sortedHotels.map((hotel, index) => (
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
