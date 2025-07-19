import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./Results.css";
import SearchBanner from "./SearchBanner";

const HOTELS_PER_PAGE = 18;

export default function Results() {
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";
  const uid = searchParams.get("uid") || "";
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");
  const roomsParam = parseInt(searchParams.get("rooms") || "1", 10);
  const adultsParam = parseInt(searchParams.get("adults") || "1", 10);
  const childrenParam = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adultsParam + childrenParam;

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const searchRef = useRef(null);
  const rgRef = useRef(null);
  const [rgOpen, setRgOpen] = useState(false);

  // const hotels = [
  //   { name: "Marina Bay Sands", location: "Singapore", price: 500, guestRating: 9.1, starRating: 5 },
  //   { name: "Orchard Hotel", location: "Singapore", price: 200, guestRating: 8.0, starRating: 4 },
  //   { name: "Bali Beach Resort", location: "Bali", price: 150, guestRating: 7.5, starRating: 3 },
  //   { name: "Bangkok Grand", location: "Bangkok", price: 100, guestRating: 6.8, starRating: 2 },
  // ];

  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!uid || !checkinParam || !checkoutParam || !totalGuests) return;

    const fetchHotelPrices = async (hotelList) => {
      try {
        const res = await fetch(
          `/api/hotels/prices?destination_id=${uid}` +
          `&checkin=${checkinParam}` +
          `&checkout=${checkoutParam}` +
          `&lang=en_US&currency=SGD&country_code=SG&guests=${totalGuests}&partner_id=1`
        );

        if (!res.ok) throw new Error("Failed to fetch bulk prices");

        const priceData = await res.json();

        const priceMap = {};
        priceData.hotels?.forEach(h => {
          priceMap[h.id] = h.price;
        });

        return hotelList.map(hotel => ({
          ...hotel,
          price: priceMap[hotel.id] || hotel.price || 0,
        }));
      } catch (err) {
        console.error("Failed to fetch bulk prices:", err);
        return hotelList;
      }
    };

    const fetchHotels = async () => {
      try {
        const hotelRes = await fetch(`/api/hotels?destination_id=${uid}`);
        if (!hotelRes.ok) throw new Error("Failed to fetch hotels");

        const hotelData = await hotelRes.json();
        console.log("Fetched hotels data:", hotelData);

        const formattedHotels = hotelData.map((h) => ({
          id: h.id,
          name: h.name,
          price: h.price || 0,
          imageUrl:
            h.image_details && h.image_details.prefix && h.image_details.suffix
              ? `${h.image_details.prefix}${h.default_image_index ?? 0}${h.image_details.suffix}`
              : null,
        }));

        const hotelsWithPrices = await fetchHotelPrices(formattedHotels);
        // Filter out hotels with null, undefined, or 0 price
        const validHotels = hotelsWithPrices.filter(h => h.price);

        setHotels(validHotels);

        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setHotels([]);
      }
    };

    fetchHotels();
  }, [uid, checkinParam, checkoutParam, totalGuests]);

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
      {/* SearchBanner */}
      <SearchBanner />

      <h1 style={{ marginBottom: "1rem", marginLeft: "2rem" }}>Hotels in {destination}</h1>

      <div style={{ display: "flex", gap: "2rem", marginLeft: "2rem" }}>
        {/* Left: Hotels grid */}
        <div style={{
          flex: 3,
          display: "flex",
          flexDirection: "column",
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
                  justifyContent: "space-between",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  backgroundColor: "#fff"
                }}
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
                <div style={{ padding: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem" }}>{hotel.name}</h3>
                  <p style={{ margin: 0, color: "#555" }}>{destination}</p>
                  <p style={{ margin: "0.5rem 0", fontWeight: "bold", color: "#007bff" }}>
                    ${hotel.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => alert(`Selected: ${hotel.name}`)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem 1rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Select
                  </button>
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
