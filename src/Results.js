import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Plane } from "lucide-react";
import "./Results.css";

const HOTELS_PER_PAGE = 18;

export default function Results() {
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";
  const uid = searchParams.get("uid") || "";

  useEffect(() => {
    const fetchHotels = async () => {
      if (!uid) return;

      try {
        const hotelRes = await fetch(`/api/hotels?destination_id=${uid}`);
        if (!hotelRes.ok) throw new Error("Failed to fetch hotels");

        const hotelData = await hotelRes.json();
        console.log("Fetched hotels data:", hotelData);

        // Normalize hotel data
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
        setCurrentPage(1); // reset page when hotels reload
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setHotels([]);
      }
    };

    fetchHotels();
  }, [uid]);

  // Calculate pagination data
  const totalPages = Math.ceil(hotels.length / HOTELS_PER_PAGE);

  // Slice hotels for current page
  const hotelsToShow = hotels.slice(
    (currentPage - 1) * HOTELS_PER_PAGE,
    currentPage * HOTELS_PER_PAGE
  );

  // Handler for page change
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return (

    
    <div>
      {/* Header */}
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plane size={28} />
          <Link to="/" className="header-title" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            OCBC Travel
          </Link>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/login" className="login-btn">
            Login
          </Link>
          <Link to="/signup" className="signup-btn">
            Sign Up
          </Link>
        </div>
      </div>

      <h1 style={{ marginBottom: "1rem" }}>Hotels in {destination}</h1>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Left: Hotels grid */}
        <div
          style={{
            flex: 3,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "minmax(280px, auto)",
            gap: "1rem",
          }}
        >
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
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      backgroundColor: "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    No Image
                  </div>
                )}
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      margin: "0 0 0.5rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={hotel.name}
                  >
                    {hotel.name}
                  </h3>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      margin: 0,
                      color: "#007bff",
                    }}
                  >
                    ${hotel.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Placeholder image */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            height: "calc(6 * 280px + 5 * 1rem)",
            overflow: "hidden",
          }}
        >
          <img
            src="https://via.placeholder.com/400x1700?text=Map+Placeholder"
            alt="Map Placeholder"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Pagination controls */}
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

          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontWeight: currentPage === pageNum ? "bold" : "normal",
                  textDecoration: currentPage === pageNum ? "underline" : "none",
                  cursor: "pointer",
                }}
              >
                {pageNum}
              </button>
            );
          })}

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
