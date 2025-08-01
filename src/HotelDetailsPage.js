import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from "react-router-dom";
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
import ImageBox2 from './component/ImageBox2';

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

      <section className="rooms">
        <h2>Room Options</h2>
        {roomsLoading && <p>Loading room info...</p>}
        {roomsError && <p>Failed to load room info.</p>}
        {!roomsLoading && !roomsError && roomList.length === 0 && <p>No rooms available.</p>}
        {visibleRooms.map((room) => {
          const thumb = room.images?.[0]?.high_resolution_url
            || HOTEL_PLACEHOLDER;
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
                alt={room.roomNormalizedDescription}
                className="room-card__img"
              />

              {/* Middle: details */}
              <div className="room-card__details">
                <h3 className="room-card__title" onClick={() => {setSelectedRoom(room); setImageIndex(0);}}>{room.roomNormalizedDescription}</h3>
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
                onClick={() => navigate(`/payment-stripe?destination_name=${encodeURIComponent(destination_name)}`+
                                    `&destination_id=${encodeURIComponent(destination)}` +
                                    `&hotel=${encodeURIComponent(hotel.name)}` +
                                    `&hotel_id=${encodeURIComponent(id)}` +
                                    `&hotel_addr=${encodeURIComponent(hotel.address)}` +
                                    `&checkin=${encodeURIComponent(checkinParam)}` +
                                    `&checkout=${encodeURIComponent(checkoutParam)}` + 
                                    `&adults=${encodeURIComponent(adultsParam)}` +
                                    `&children=${encodeURIComponent(childrenParam)}` +
                                    `&price=${room.converted_price.toFixed(0)}` +
                                    `room_name=${encodeURIComponent(room.roomNormalizedDescription)}` +
                                    `nights=${encodeURIComponent(nights)}`)
                }                                    
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

        {selectedRoom && (
          <div className={`modal-overlay ${selectedRoom ? 'show' : ''}`} onClick={() => setSelectedRoom(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                  <div className="room-modal-content">
                      <div className="modal-image-carousel">
                          <img
                              src={selectedRoom.images?.[imageIndex]?.high_resolution_url || HOTEL_PLACEHOLDER}
                              alt={`Room Image ${imageIndex + 1}`}
                          />
                          {selectedRoom.images?.length > 1 && (
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
                        <button className="room-modal-close" onClick={e => {
                          e.stopPropagation();
                          setSelectedRoom(false);
                        }}>&times;</button>
                        <div className="room-modal-header">
                          <h2>{selectedRoom.roomNormalizedDescription}</h2>
                          {/* <button className="room-modal-close" onClick={e => {e.stopPropagation(); setSelectedRoom(false);}}>&times;</button> */}
                        </div>
                        <div className="scrollable-room-content">
                          {selectedRoom.market_rates && selectedRoom.market_rates.length > 0 && (
                            <div className="room-market-rates" style={{ marginBottom: '1em' }}>
                              <h3 style={{ marginBottom: '0.3em' }}>Market Rates:</h3>
                              {selectedRoom.market_rates.map((rate, index) => (
                                <div key={index} style={{ marginBottom: '0.2em' }} className="room-details">
                                  <p style={{ margin: 0 }}>- Supplier: {rate.supplier}</p>
                                  <p style={{ margin: 0 }}>- Rate: SGD {rate.rate.toFixed(0)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <h3 style={{ marginBottom: '0.3em' }}>Description:</h3>
                          {selectedRoom.long_description && (
                              <div className="room-details" dangerouslySetInnerHTML={{ __html: selectedRoom.long_description }} />
                          )}
                          <h3 style={{ marginBottom: '0em' }}>Amenities:</h3>
                          {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                            <div className="room-details">                              
                              <ul style={{ paddingLeft: '1em', margin: 0 }}>
                                {selectedRoom.amenities.map((amenity, index) => (
                                  <li key={index}>{amenity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
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