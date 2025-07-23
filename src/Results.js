import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./css/Results.css";
import SearchBanner from "./component/SearchBanner";
import { MapContainer, TileLayer, Marker, Tooltip  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const searchRef = useRef(null);
  const rgRef = useRef(null);
  const [rgOpen, setRgOpen] = useState(false);
  const [center, setCenter] = useState([1.3521, 103.8198]); // default singapore
  const HOTEL_PLACEHOLDER = "/photos/hotelplaceholder.png"

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

  // SortBy state (default "rating" or from URL)
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "rating");

  // Data state
  const [totalHotels, setTotalHotels] = useState(0);
  const totalPages = Math.ceil(totalHotels / HOTELS_PER_PAGE);

  const [pagesCache, setPagesCache] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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

    // Update sortBy
    if (sortBy) params.set("sortBy", sortBy);
    else params.delete("sortBy");

    // Preserve existing essential params (destination, uid, checkin, etc)
    // You can do this by copying params from location.search as above.

    // Reset back to page 1 whenever filter changes
    setCurrentPage(1);

    // Update URL without reloading (push state)
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    }, { replace: true });
  }, [filters, sortBy, navigate, location.pathname]);

  const fetchPage = async (pageNum, isPrefetch = false) => { // prevent interruption to map as future pages load
    if (!uid || !checkinParam || !checkoutParam || !totalGuests) return;

    if (!isPrefetch) setIsLoading(true);
    try {
      const params = new URLSearchParams();

      params.set("uid", uid);
      params.set("checkin", checkinParam);
      params.set("checkout", checkoutParam);
      params.set("adults", adultsParam.toString());
      params.set("children", childrenParam.toString());
      params.set("page", pageNum);
      params.set("limit", HOTELS_PER_PAGE);

      if (filters.starRating) params.set("starRating", filters.starRating);
      if (filters.guestRating) params.set("guestRating", filters.guestRating);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (sortBy) params.set("sortBy", sortBy);

      const url = `/api/hotels?${params.toString()}`;

      const hotelRes = await fetch(url);
      if (!hotelRes.ok) throw new Error("Failed to fetch hotels");

      const hotelData = await hotelRes.json();

      const formattedHotels = hotelData.hotels.map((h) => ({
        id: h.id,
        name: h.name,
        price: h.price || 0,
        rating: h.rating,
        guestRating: h.trustyou?.score?.overall || 0,
        imageUrl:
          h.image_details && h.image_details.prefix && h.image_details.suffix
            ? `${h.image_details.prefix}${h.default_image_index ?? 0}${h.image_details.suffix}`
            : null,
        latitude: h.latitude ?? null,
        longitude: h.longitude ?? null,
      }));

      setPagesCache((prevCache) => ({
        ...prevCache,
        [pageNum]: {
          hotels: formattedHotels,
          total: hotelData.total,
        },
      }));

      if (pageNum === 1 || hotelData.total !== totalHotels) {
        setTotalHotels(hotelData.total);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setPagesCache((prevCache) => ({
        ...prevCache,
        [pageNum]: { hotels: [], total: 0 },
      }));
    } finally {
      if (!isPrefetch) setIsLoading(false); // ✅ This ensures the map & page know when to render
    }
  };

  // auto fetch whenever params change
  useEffect(() => {
    setPagesCache({});
    setCurrentPage(1);
    fetchPage(1);
  }, [uid, checkinParam, checkoutParam, adultsParam, childrenParam, filters, sortBy]);

  // Prefetch pages 2..totalPages with staggered delay
  useEffect(() => {
    if (totalPages <= 1) return;
    if (!pagesCache[1]) return; // wait for page 1 load

    const timers = [];

    for (let p = 2; p <= totalPages; p++) {
      if (!pagesCache[p]) {
        const timer = setTimeout(() => fetchPage(p, true), (p - 1) * 1500);
        timers.push(timer);
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [totalPages, pagesCache]);

  // Handler for pagination button click, fetch if page not cached
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    if (!pagesCache[pageNum]) {
      fetchPage(pageNum);
    }
  };

  // Use cached hotels for current page or empty while loading
  const hotelsToShow = pagesCache[currentPage]?.hotels || [];

  useEffect(() => {
    if (hotelsToShow.length > 0) {
      const { latitude, longitude } = hotelsToShow[0];
      setCenter([latitude, longitude]);
    }
  }, [hotelsToShow]);



  const getNights = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
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

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "0.3rem 0.5rem" }}
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="guestRating">Sort by Guest Rating</option>
          </select>

          <button
            style={{
              marginLeft: "1rem",
              padding: "0.4rem 0.8rem",
              backgroundColor: "#f08e8e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Filter
          </button>

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
                      src={hotel.imageUrl || HOTEL_PLACEHOLDER}
                      alt={hotel.name}
                      style={{
                        width: "30%",
                        height: "100%",
                        minWidth: "150px",

                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        // if the URL 404s at runtime, swap in the placeholder
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = HOTEL_PLACEHOLDER;
                      }}
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
                    <p style={{ margin: "0.2rem 0", fontSize: "0.9rem", color: "#555" }}>
                      ⭐ Star Rating: {hotel.rating ?? "N/A"} <br />
                      👤 Guest Rating: {hotel.guestRating ?? "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/room?id=${hotel.id}`+ 
                      `&destination=${uid}` + 
                      `&checkin=${checkinParam}` + 
                      `&checkout=${checkoutParam}` + 
                      `&adults=${adultsParam}` + 
                      `&children=${childrenParam}`
                    )}
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
          marginLeft: "1rem",
          width: "40rem",
          height: "calc(100vh - 7rem)", // prevent going off screen
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}>
          {isLoading ? (
            <p style={{ fontSize: "1rem", color: "#888" }}>Loading map...</p>
          ) : (
          <MapContainer
            key={center.join(",")}
            center={center} // Singapore default center
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            whenCreated={map => {
              setMapInstance(map)
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {hotelsToShow.map(
              (hotel) =>
                hotel.latitude &&
                hotel.longitude && (
                  <Marker
                    key={hotel.id}
                    position={[hotel.latitude, hotel.longitude]}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                      <div style={{ minWidth: "150px", maxWidth: "200px" }}>
                        {hotel.imageUrl ? (
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            style={{
                              width: "100%",
                              maxHeight: "100px",
                              objectFit: "cover",
                              marginTop: "0.3rem",
                              borderRadius: "4px"
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "80px",
                              backgroundColor: "#ccc",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              marginTop: "0.3rem",
                              fontSize: "0.75rem"
                            }}
                          >
                            No Image
                          </div>
                        )}
                        <br />
                        💰 Price: ${hotel.price.toLocaleString()}
                        <br />
                        <strong>{hotel.name}</strong>
                        <br />
                        ⭐ Star Rating: {hotel.rating ?? "N/A"}
                        <br />
                        👤 Guest Rating: {hotel.guestRating ?? "N/A"}
                        <br />                        
                      </div>
                    </Tooltip>
                  </Marker>
                )
            )}

          </MapContainer>
          )}
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
        )
      }
    </div >
  );
}
