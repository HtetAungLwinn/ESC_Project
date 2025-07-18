import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import Fuse from "fuse.js";
import DateRangePicker from "./ReactDatePicker";
import "./Results.css";
import SearchBanner from "./SearchBanner";

const HOTELS_PER_PAGE = 18;

export default function Results() {
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const destination = searchParams.get("destination") || "";
  const uid = searchParams.get("uid") || "";
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");
  const roomsParam = parseInt(searchParams.get("rooms") || "1", 10);
  const adultsParam = parseInt(searchParams.get("adults") || "1", 10);
  const childrenParam = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adultsParam + childrenParam;

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

  // const hotels = [
  //   { name: "Marina Bay Sands", location: "Singapore", price: 500, guestRating: 9.1, starRating: 5 },
  //   { name: "Orchard Hotel", location: "Singapore", price: 200, guestRating: 8.0, starRating: 4 },
  //   { name: "Bali Beach Resort", location: "Bali", price: 150, guestRating: 7.5, starRating: 3 },
  //   { name: "Bangkok Grand", location: "Bangkok", price: 100, guestRating: 6.8, starRating: 2 },
  // ];


  const initialFilters = {
    starRating: searchParams.get("starRating") || "",
    guestRating: searchParams.get("guestRating") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    // Build new URLSearchParams based on current filters + other existing params
    const params = new URLSearchParams(location.search);

    if (filters.starRating) params.set("starRating", filters.starRating);
    else params.delete("starRating");

    if (filters.guestRating) params.set("guestRating", filters.guestRating);
    else params.delete("guestRating");

    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    else params.delete("minPrice");

    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    else params.delete("maxPrice");

    // Preserve existing essential params (destination, uid, checkin, etc)
    // You can do this by copying params from location.search as above.

    // Update URL without reloading (push state)
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    }, { replace: true });
  }, [filters, navigate, location.pathname]);



  const fuse = useMemo(
    () => new Fuse(allDestinations, { threshold: 0.3, minMatchCharLength: 2 }),
    [allDestinations]
  );

  useEffect(() => {
    fetch("/api/destinations/all")
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

    const checkin = dateRange.startDate?.toLocaleDateString('en-CA');
    const checkout = dateRange.endDate?.toLocaleDateString('en-CA');

    fetch(`/api/destinations/uid?term=${encodeURIComponent(destinationInput)}`)
      .then(res => res.json())
      .then(data => {
        const uid = data.uid;
        const nights = getNights();

        navigate(
          `/results?destination=${encodeURIComponent(destinationInput)}` +
          `&uid=${encodeURIComponent(uid)}` +
          `&checkin=${checkin}` +
          `&checkout=${checkout}` +
          `&nights=${nights}` +
          `&rooms=${rooms}` +
          `&adults=${adults}` +
          `&children=${children}`
        );
      });
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
      {/* Header */}


      {/* SearchBanner */}
      <SearchBanner />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "1rem 2rem",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <h1 style={{ margin: 0 }}>Hotels in {destination}</h1>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {/* Star Rating Dropdown */}
          <select
            value={filters.starRating}
            onChange={(e) => setFilters({ ...filters, starRating: e.target.value })}
            style={{ padding: "0.3rem 0.5rem" }}
          >
            <option value="">Star Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Guest Rating Dropdown */}
          <select
            value={filters.guestRating}
            onChange={(e) => setFilters({ ...filters, guestRating: e.target.value })}
            style={{ padding: "0.3rem 0.5rem" }}
          >
            <option value="">Guest Rating</option>
            <option value="9">9+ Excellent</option>
            <option value="8">8+ Very Good</option>
            <option value="7">7+ Good</option>
            <option value="6">6+ Okay</option>
          </select>

          {/* Min Price Input */}
          <input
            type="number"
            min="0"
            value={filters.minPrice || ""}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            placeholder="Min Price"
            style={{
              padding: "0.3rem 0.5rem",
              width: "80px",
              textAlign: "center",
            }}
          />

          {/* Max Price Input */}
          <input
            type="number"
            min="0"
            value={filters.maxPrice || ""}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            placeholder="Max Price"
            style={{
              padding: "0.3rem 0.5rem",
              width: "80px",
              textAlign: "center",
            }}
          />

        </div>
      </div>


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
                  flexDirection: "row",
                  alignItems: "stretch",
                  gap: "1rem",
                  height: "min(25vh, 250px)",
                  width: "100%",
                  maxWidth: "60rem",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                  padding: "1rem",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >

                {
                  hotel.imageUrl ? (
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      style={{
                        width: "30%",
                        height: "100%",
                        minWidth: "150px",

                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                      loading="lazy"
                    />

                  ) : (
                    <div
                      style={{
                        width: "200px",
                        height: "100%",
                        backgroundColor: "#ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: "0.8rem",
                        borderRadius: "4px",
                      }}
                    >
                      No Image
                    </div>

                  )
                }
                < div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem" }}>{hotel.name}</h3>
                    <p style={{ margin: 0, color: "#777" }}>{destination}</p>
                    <p style={{ margin: "0.3rem 0", fontWeight: "bold", color: "#007bff" }}>
                      ${hotel.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => alert(`Selected: ${hotel.name}`)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 1rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      alignSelf: "flex-start"
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
          position: "sticky",
          top: "6rem", // adjust this to match your header height
          alignSelf: "flex-start", // ensure it sticks to the top of its column
          width: "300px",
          height: "calc(100vh - 7rem)", // prevent going off screen
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}>
          <img
            src="https://via.placeholder.com/400x1700?text=Map+Placeholder"
            alt="Map Placeholder"
            style={{ width: "75%", height: "100%", objectFit: "cover" }}
          />
        </div>


      </div >

      {/* Pagination */}
      {
        totalPages > 1 && (
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
        )
      }
    </div >
  );
}
