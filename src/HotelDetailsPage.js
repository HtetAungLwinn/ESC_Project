import React,  { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { Plane } from "lucide-react";
import './css/HotelDetailsPage.css';
import SearchBanner from "./component/SearchBanner";
import HotelMap from './component/HotelMap';
import ImageBox from './component/ImageBox';

// const amenities = [
//   'Air Conditioning', 'Business Center', 'Clothing Iron', 'Data Ports',
//   'Dry Cleaning', 'Hair Dryer', 'Meeting Rooms', 'Outdoor Pool',
//   'Parking Garage', 'Safe', 'Room Service', 'TV in Room', 'Voicemail'
// ];

// const rooms = [
//   { id: 1, title: 'King Deluxe Room', description: 'Spacious room with king bed, city views.', price: '$2,024', guests: '2 Adults', image: '/images/room1.jpg' },
//   { id: 2, title: 'Queen Superior Room', description: 'Cozy room with queen bed and premium amenities.', price: '$2,024', guests: '2 Adults', image: '/images/room2.jpg' }
// ];

// const reviews = [
//   { id: 1, rating: 5, text: 'Sleep deprived', reviewer: 'SUTD student' },
//   { id: 2, rating: 4, text: 'Great location but noisy at night', reviewer: 'John D.' },
//   { id: 3, rating: 5, text: 'Excellent service and amenities!', reviewer: 'Lisa W.' }
// ];

export default function HotelDetailsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || ""; // Hotel id
  const destination = searchParams.get("destination") || ""; // Destination
  const checkinParam = searchParams.get("checkin"); // check in date
  const checkoutParam = searchParams.get("checkout"); // check out date
  const adultsParam = parseInt(searchParams.get("adults") || "1", 10);
  const childrenParam = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adultsParam + childrenParam; // total guests
  const lang = searchParams.get("lang") || "en_US"; // language
  const currency = searchParams.get("currency") || "SGD"; // currency
  const countryCode = searchParams.get("country_code") || "SG"; // country code
  const partnerId = searchParams.get("partner_id") || "1"; // partner id
 

  const [hotel, setHotel] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
  const charLimit = 300;

  useEffect(() => {
    if (id) {
      fetch(`/api/rooms/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Hotel not found");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched hotel data:", data);
          setHotel(data)
        })
        .catch((err) => console.error("Error fetching hotel room:", err));
    }
  }, [id]);

  // Room Options
  useEffect(() => {
    if (!destination || !checkinParam || !checkoutParam || !totalGuests || !id) return;
    
    fetch(
      `/api/hotels/${id}/price?destination_id=${destination}` +
      `&checkin=${checkinParam}` +
      `&checkout=${checkoutParam}` +
      `&lang=en_US&currency=SGD&country_code=SG&guests=${totalGuests}&partner_id=1`
    )
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch room prices");
      return res.json();
    })
    .then((data) => {
      console.log("Fetched room prices data:", data);
      // If your API returns array directly, do this:
      setRoomList(data.rooms || []);
    })
    .catch((err) => console.error("Failed to fetch room prices:", err));
    }, [destination, checkinParam, checkoutParam, totalGuests, id]);

  if (!hotel) return <p>Loading hotel info...</p>;

  // Overview
  const fullDesc = hotel.description || "";
  const shortDesc = fullDesc.slice(0, charLimit);
  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div>
      {/* SearchBanner */}
      <SearchBanner />

      <section className="gallery">
        {/* <div className="gallery-main">
          <img src="/images/main.jpg" alt="Main view" />
        </div>
        <div className="gallery-side">
          <img src="/images/side1.jpg" alt="Side view 1" />
          <img src="/images/side2.jpg" alt="Side view 2" />
          <img src="/images/side3.jpg" alt="Side view 3" />
        </div> */}
        {hotel && <ImageBox hotel={hotel} />}
      </section>

      <section className="content-section">
        <div className="overview">
          <h1>{hotel.name}</h1>
          <div className="stars">
            {Array(5).fill(null).map((_, index) => (
              <AiFillStar key={index} />
            ))}
          </div>
          <p className="address">
            <FiMapPin /> {hotel.address} — <a href="#">show map</a>
          </p>
          <h2>Overview</h2>
          <div style={{ display: "inline" }}>
          <span
            dangerouslySetInnerHTML={{
              __html: expanded ? fullDesc : shortDesc + "...",
            }}
          />
            <span
              onClick={toggleExpanded}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                cursor: "pointer",
                textDecoration: hover ? "underline" : "none",
                color: hover ? "blue" : "black",
                display: "inline",
                marginLeft: "4px",
              }}
            >
              {expanded ? "Read less" : "Read more"}
            </span>
          </div>
        </div>
        <aside className="highlights">
          <h3>Highlights</h3>
          <ul>
            <li style={{ marginBottom: '10px' }}>
              Rating: 
              <span style={{ fontStyle: 'italic', color: '#555' }}>
                {hotel.rating >= 4.5 ? ' "Excellent" '
                  : hotel.rating >= 4.0 ? ' "Very Good" '
                  : hotel.rating >= 3.0 ? ' "Good" '
                  : ''}
              </span>
            </li>
            <li style={{ marginBottom: '20px' }}>{hotel.rating.toFixed(1)} / 5.0 {' '}</li>
            {hotel.amenities_ratings.map((item) => (
              <li key={item.name} style={{ marginBottom: '10px' }}>
                <div>{item.name}</div>
                <div 
                  style={{
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    height: '12px',
                    width: '200px',
                    marginTop: '4px'
                  }}
                >
                  <div 
                    style={{
                      width: `${item.score}%`,
                      backgroundColor: '#4caf50',
                      height: '100%',
                      transition: 'width 0.5s ease-in-out'
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {hotel.amenities && Object.values(hotel.amenities).some(value => value) && (
        <section className="amenities">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {Object.entries(hotel.amenities)
              .filter(([_, value]) => value)
              .map(([key]) => (
                <div key={key} className="amenity-item">
                  {formatAmenityName(key)}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* <section className="reviews">
        <h2>Reviews</h2>
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="stars">
                {Array(review.rating).fill().map((_, i) => (
                  <AiFillStar key={i} />
                ))}
              </div>
              <p className="review-text">{review.text}</p>
              <p className="reviewer">— {review.reviewer}</p>
            </div>
          ))}
        </div>
      </section> */}

      <section className="rooms">
        <h2>Room Options</h2>
        {roomList.length > 0 ? (
          roomList.map((room) => (
            <div key={room.key} style={{ marginBottom: "20px" }}>
              <h3>{room.roomDescription}</h3>
              <p>Free cancellation: {room.free_cancellation ? "Yes" : "No"}</p>
              <h2>Description</h2>
              <div style={{ display: "inline" }}>
              <span
                dangerouslySetInnerHTML={{
                  __html: expanded ? fullDesc : shortDesc + "...",
                }}
              />
                <span
                  onClick={toggleExpanded}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{
                    cursor: "pointer",
                    textDecoration: hover ? "underline" : "none",
                    color: hover ? "blue" : "black",
                    display: "inline",
                    marginLeft: "4px",
                  }}
                >
                  {expanded ? "Read less" : "Read more"}
                </span>
              </div>
              <div>
                <h2>Additional Information</h2>
                {Object.entries(room.roomAdditionalInfo.displayFields).map(([key, html]) => (
                  <div key={key} style={{ marginBottom: "1rem" }}>
                    <strong>{formatAmenityName(key)}</strong>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No rooms available or still loading...</p>
        )}
        <div className="see-more">
          <FiChevronDown /> See More Rooms
        </div>
      </section>

      {hotel.latitude && hotel.longitude && (
        <section className="location-map">
          <h2>Location</h2>
          <HotelMap latitude={hotel.latitude} longitude={hotel.longitude} name={hotel.name}/>
        </section>
      )}
    </div>
  );
}

function formatAmenityName(key) {
  // Handle known acronyms first
  const acronyms = ['TV', 'AC', 'WiFi', 'Wi-Fi'];
  key = key.replace(/tV/, 'TV ');
  let spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // Insert space before capital letters
  let words = spaced.split(' ').map(word => { // Capitalise words & fix acronyms:
    const upper = word.toUpperCase();
    if (acronyms.some(a => a.toUpperCase() === upper)) {
      return acronyms.find(a => a.toUpperCase() === upper);
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return words.join(' ');
}
