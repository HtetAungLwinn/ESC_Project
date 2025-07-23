import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import {
  FaHeart,
  FaBriefcase,
  FaUsers,
  FaStar,
  FaStarHalfAlt,
  FaRegStar
} from 'react-icons/fa';
import './css/HotelDetailsPage.css';
import SearchBanner from "./component/SearchBanner";
import HotelMap from './component/HotelMap';
import ImageBox from './component/ImageBox';

// Map known category keys to icons (optional)
const categoryIconMap = {
  romantic_hotel: <FaHeart color="hotpink" />,
  business_hotel: <FaBriefcase color="#0077b6" />,
  family_hotel: <FaUsers color="#f4a261" />,
  design_hotel: <FaStar color="#8e44ad" />,       // example fallback
  budget_hotel: <FaRegStar color="#27ae60" />,     // example fallback
  // add more mappings as you like...
};

// Reusable star-rating component (supports half stars)
function PurposeRating({ label, icon, score }) {
  // Convert 0–100 to a 0–5 scale, rounded to nearest half
  const raw = (score / 100) * 5;
  const rounded = Math.round(raw * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="purpose-item">
      {icon || null}
      <span className="purpose-label">{label}:</span>
      <span className="purpose-stars">
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar key={`full-${i}`} color="#f4b400" />
        ))}
        {hasHalf && <FaStarHalfAlt key="half" color="#f4b400" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FaRegStar key={`empty-${i}`} color="#ccc" />
        ))}
      </span>
    </div>
  );
}

export default function HotelDetailsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id") || "";
  const destination = searchParams.get("destination") || "";
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");
  const adultsParam = parseInt(searchParams.get("adults") || "1", 10);
  const childrenParam = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adultsParam + childrenParam;
  const lang = searchParams.get("lang") || "en_US";
  const currency = searchParams.get("currency") || "SGD";
  const countryCode = searchParams.get("country_code") || "SG";
  const partnerId = searchParams.get("partner_id") || "1";

  const [hotel, setHotel] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
  const charLimit = 300;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/rooms/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Hotel not found");
        return res.json();
      })
      .then(data => setHotel(data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    if (!destination || !checkinParam || !checkoutParam || !totalGuests || !id) return;
    fetch(
      `/api/hotels/${id}/price?destination_id=${destination}` +
      `&checkin=${checkinParam}` +
      `&checkout=${checkoutParam}` +
      `&lang=${lang}&currency=${currency}&country_code=${countryCode}` +
      `&guests=${totalGuests}&partner_id=${partnerId}`
    )
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch room prices");
      return res.json();
    })
    .then(data => setRoomList(data.rooms || []))
    .catch(err => console.error(err));
  }, [destination, checkinParam, checkoutParam, totalGuests, id]);

  if (!hotel) return <p>Loading hotel info...</p>;

  const fullDesc = hotel.description || "";
  const shortDesc = fullDesc.slice(0, charLimit);
  const toggleExpanded = () => setExpanded(prev => !prev);

  return (
    <div>
      <SearchBanner />

      <section className="gallery">
        <ImageBox hotel={hotel} />
      </section>

      <section className="content-section">
        <div className="overview">
          <h1>{hotel.name}</h1>
          
          {/* Dynamically render every category except "overall" */}
          <div className="purpose-ratings">
            {Object.entries(hotel.categories || {})
              .filter(([key]) => key !== 'overall')
              .map(([key, cat]) => (
                <PurposeRating
                  key={key}
                  label={cat.name}
                  icon={categoryIconMap[key] || null}
                  score={cat.score}
                />
              ))
            }
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
                marginLeft: 4,
              }}
            >
              {expanded ? "Read less" : "Read more"}
            </span>
          </div>
        </div>

        <aside className="highlights">
          <h3>Highlights</h3>
          <ul>
            <li style={{ marginBottom: 10 }}>
              Rating:
              <span style={{ fontStyle: 'italic', color: '#555' }}>
                {hotel.rating >= 4.5 ? ' "Excellent"'
                  : hotel.rating >= 4.0 ? ' "Very Good"'
                  : hotel.rating >= 3.0 ? ' "Good"' : ''}
              </span>
            </li>
            <li style={{ marginBottom: 20 }}>
              {hotel.rating.toFixed(1)} / 5.0
            </li>
            {hotel.amenities_ratings.map(item => (
              <li key={item.name} style={{ marginBottom: 10 }}>
                <div>{item.name}</div>
                <div
                  style={{
                    backgroundColor: '#e0e0e0',
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: 12,
                    width: 200,
                    marginTop: 4
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

      {hotel.amenities && Object.values(hotel.amenities).some(v => v) && (
        <section className="amenities">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {Object.entries(hotel.amenities)
              .filter(([, v]) => v)
              .map(([key]) => (
                <div key={key} className="amenity-item">
                  {formatAmenityName(key)}
                </div>
              ))
            }
          </div>
        </section>
      )}

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
          <HotelMap latitude={hotel.latitude} longitude={hotel.longitude} name={hotel.name} />
        </section>
      )}
    </div>
  );
}

function formatAmenityName(key) {
  const acronyms = ['TV','AC','WiFi','Wi-Fi'];
  let spaced = key.replace(/([a-z])([A-Z])/g,'$1 $2');
  return spaced.split(' ').map(word => {
    const up = word.toUpperCase();
    return acronyms.includes(up) ? acronyms.find(a => a.toUpperCase()===up) :
      word[0].toUpperCase()+word.slice(1).toLowerCase();
  }).join(' ');
}