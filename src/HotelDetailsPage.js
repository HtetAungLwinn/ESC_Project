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
  FaRegStar,
  FaCoffee
} from 'react-icons/fa';
import './css/HotelDetailsPage.css';
import { GiKnifeFork } from 'react-icons/gi';
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
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const initialVisible = 2; // set rooms to show

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
      `&guests=${totalGuests}&partner_id=${partnerId}`
    )
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch room prices");
      return res.json();
    })
    .then(data => setRoomList(data.rooms || []))
    .catch(err => console.error(err));
  }, [destination, checkinParam, checkoutParam, totalGuests, id]);

  useEffect(() => {
    if (selectedRoom) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setShowModal(false);
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

  if (!selectedRoom) return null;

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

        {visibleRooms.map((room) => {
          const thumb = room.images?.[0]?.high_resolution_url
            || '/images/room-placeholder.jpg';
          const isBreakfast = room.roomAdditionalInfo?.breakfastInfo
            ?.toLowerCase().includes('breakfast');

          // calculate nights
          let nights = '';
          if (checkinParam && checkoutParam) {
            const inD = new Date(checkinParam);
            const outD = new Date(checkoutParam);
            nights = Math.round((outD - inD) / (1000*60*60*24));
          }

          return (
            <div className="room-card" key={room.key}>
              {/* Left: thumbnail */}
              <img
                src={thumb}
                alt={room.roomDescription}
                className="room-card__img"
              />

              {/* Middle: details */}
              <div className="room-card__details">
                <h3 className="room-card__title" onClick={() => {setSelectedRoom(room); setImageIndex(0);}}>{room.roomDescription}</h3>
                <p className="room-card__line">
                  {isBreakfast ? '☕ Breakfast Included' : 'Room Only'}
                </p>
                <p className="room-card__sub">
                  {room.free_cancellation ? 'Free cancellation' : 'Non-refundable'}
                </p>
                <p className="room-card__price">
                  SGD {room.converted_price.toFixed(0)}
                </p>
                <p className="room-card__duration">
                  1 room • {nights} night{nights > 1 ? 's' : ''}
                </p>
              </div>

              {/* Right: select button */}
              <button
                className="room-card__btn"
                onClick={() => console.log('Select', room.key)}
              >
                Select
              </button>
            </div>
          );
        })}

        {roomList.length > initialVisible && (
          <button
            className="see-more-rooms"
            onClick={() => setShowAllRooms(prev => !prev)}
          >
            {!showAllRooms ? (
              <>
                <FiChevronDown size={20} style={{ verticalAlign: 'middle' }} />
                <span style={{ marginLeft: 8 }}>More Rooms</span>
              </>
            ) : (
              'Show Less'
            )}
          </button>
        )}

        {/* {selectedRoom && ( */}
    <div className={`modal-overlay ${selectedRoom ? 'show' : ''}`} onClick={() => setSelectedRoom(false)}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="room-modal-content">
                <div className="modal-image-carousel">
                    <img
                        src={selectedRoom.images?.[imageIndex]?.high_resolution_url || '/images/room-placeholder.jpg'}
                        alt={`Room Image ${imageIndex + 1}`}
                    />
                    {/* Show carousel navigation only if there's more than one image */}
                    {selectedRoom.images && selectedRoom.images.length > 1 && (
                        <>
                            <button
                                className="carousel-left"
                                onClick={() => setImageIndex(prev => (prev - 1 + selectedRoom.images.length) % selectedRoom.images.length)}
                            >
                                &#10094;
                            </button>
                            <button
                                className="carousel-right"
                                onClick={() => setImageIndex(prev => (prev + 1) % selectedRoom.images.length)}
                            >
                                &#10095;
                            </button>
                            <div className="image-count">
                                {imageIndex + 1} / {selectedRoom.images.length}
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-room-info">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h2>{selectedRoom.roomDescription}</h2>
                    <button className="room-modal-close" onClick={e => {e.stopPropagation(); setShowModal(false);}}>&times;</button>
                  </div>
                  <div className="scrollable-room-content">
                    {selectedRoom.roomAdditionalInfo?.beds && (
                        <p className="room-subtitle">Beds: {selectedRoom.roomAdditionalInfo.beds}</p>
                    )}
                    {selectedRoom.roomSize && (
                        <p className="room-subtitle">Size: {selectedRoom.roomSize}</p>
                    )}
                    {/* Using dangerouslySetInnerHTML for long_description */}
                    {selectedRoom.long_description && (
                        <div className="room-details" dangerouslySetInnerHTML={{ __html: selectedRoom.long_description }} />
                    )}
                </div>
                </div>
            </div>
        </div>
    </div>
{/* )} */}


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