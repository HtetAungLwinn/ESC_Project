import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from "react-router-dom";
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import {
  FaHeart,
  FaBriefcase,
  FaUsers,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from 'react-icons/fa';
import './css/HotelDetailsPage.css';
// import HotelMap from './component/HotelMap'; read in LocationMapSection below
import ImageBox from './component/ImageBox';
import ImageBox2 from './component/ImageBox2';

import RoomsSection from './RoomsSection';
import LocationMapSection from './LocationMapSection';


const HOTEL_PLACEHOLDER = "/photos/hotelplaceholder.png";

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
  const destination = searchParams.get("destination_id") || "";
  const destination_name = searchParams.get("destination_name");
  const checkinParam = searchParams.get("checkin");
  const checkoutParam = searchParams.get("checkout");
  const adultsParam = parseInt(searchParams.get("adults") || "1", 10);
  const childrenParam = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adultsParam + childrenParam;
  const lang = searchParams.get("lang") || "en_US";
  const currency = searchParams.get("currency") || "SGD";
  const countryCode = searchParams.get("country_code") || "SG";
  const partnerId = searchParams.get("partner_id") || "1089";
  const landing_page = searchParams.get("landing_page") || "wl-acme-earn";
  const product_type = searchParams.get("product_type") || "earn";

  const [hotel, setHotel] = useState(null);

  const [roomList, setRoomList] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const initialVisible = 2; // set rooms to show

  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
  const charLimit = 1200;
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

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
    setRoomsLoading(true);
    setRoomsError(false);
    fetch(
      `/api/rooms/${id}/price?destination_id=${destination}` +
      `&checkin=${checkinParam}` +
      `&checkout=${checkoutParam}` +
      `&lang=${lang}&currency=${currency}&country_code=${countryCode}` +
      `&guests=${totalGuests}&partner_id=${partnerId}&landing_page=${landing_page}&product_type=${product_type}`
    )
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch room prices");
      return res.json();
    })
    .then(data => setRoomList(data.rooms || []))
    .catch(err => {
      console.error(err); 
      setRoomsError(true);
    })
    .finally(() => setRoomsLoading(false));;
  }, [destination, checkinParam, checkoutParam, totalGuests, id]);

  useEffect(() => {
    if (selectedRoom) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setSelectedRoom(false);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedRoom]);

  const visibleRooms = showAllRooms
  ? roomList
  : roomList.slice(0, initialVisible);

  if (!hotel) return <p>Loading hotel info...</p>;
  const fullDesc = hotel.description || "";
  const shortDesc = fullDesc.slice(0, charLimit);
  const toggleExpanded = () => setExpanded(prev => !prev);

  return (
    <div>
      <section className="gallery">
        
        {hotel && hotel.image_details && hotel.hires_image_index ? (
          <ImageBox hotel={hotel} 
          />
        ) : (
          <ImageBox2 hotel={hotel} />
        )}
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

    {/* seperated room options section into a different file for easier testing --> RoomsSection.js*/}
    <RoomsSection
      roomsLoading={roomsLoading}
      roomsError={roomsError}
      roomList={roomList}
      checkinParam={checkinParam}
      checkoutParam={checkoutParam}
      destination_name={destination_name}
      destination={destination}
      hotel={hotel}
      id={id}
      adultsParam={adultsParam}
      childrenParam={childrenParam}
    />

    {/* likewise ^ seperated map section into diff file --> LocationMapSection.js */}
    <LocationMapSection hotel={hotel} />

    </div>
  );
}
function formatAmenityName(key) {
  const acronyms = ['TV', 'AC', 'WiFi', 'Wi-Fi'];
  acronyms.forEach(acronym => {
    key = key.replace(new RegExp(acronym, 'gi'), `__${acronym}__`);
  });
  let words = key.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[\s_]+/);
  return words
    .map(word => {
      if (word.startsWith('__') && word.endsWith('__')) {
        return word.replace(/__/g, '');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}