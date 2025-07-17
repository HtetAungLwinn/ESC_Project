// src/Home.js
import React from "react";
import HeaderBanner from "./HeaderBanner";
import SearchBanner  from "./SearchBanner";

export default function Home({ loggedIn, setLoggedIn }) {
  return (
    <div>

      {/* Banner */}
      <div className="img">
        <img
          src={process.env.PUBLIC_URL + "/photos/headliner.jpg"}
          alt="Banner"
        />
      </div>

      {/* Title */}
      <h1 className="centered">Travel Website</h1>
      <p className="subheading">
        Discover amazing hotels, compare prices, and book your ideal
        accommodation for your next adventure.
      </p>

      {/* Search */}
      <SearchBanner />
    </div>
  );
}
