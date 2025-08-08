import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

const HOTEL_PLACEHOLDER = "/photos/hotelplaceholder.png";

export default function RoomsSection({
  roomsLoading,
  roomsError,
  roomList,
  checkinParam,
  checkoutParam,
  destination_name,
  destination,
  hotel,
  id,
  adultsParam,
  childrenParam,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const initialVisible = 2;
  const totalGuests = adultsParam + childrenParam;

  const visibleRooms = showAllRooms
    ? roomList
    : roomList.slice(0, initialVisible);

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

  return (
    <section className="rooms">
      <h2>Room Options</h2>
      {roomsLoading && <p>Loading room info...</p>}
      {roomsError && <p>Failed to load room info.</p>}
      {!roomsLoading && !roomsError && roomList.length === 0 && (
        <p>No rooms available.</p>
      )}

      {visibleRooms.map((room) => {
        const thumb = room.images?.[0]?.high_resolution_url || HOTEL_PLACEHOLDER;
        const isBreakfast = room.roomAdditionalInfo?.breakfastInfo
          ?.toLowerCase()
          .includes('breakfast');

        // calculate nights
        let nights = '';
        if (checkinParam && checkoutParam) {
          const inD = new Date(checkinParam);
          const outD = new Date(checkoutParam);
          nights = Math.round((outD - inD) / (1000 * 60 * 60 * 24));
        }

        return (
          <div className="room-card" key={room.key}>
            <img
              src={thumb}
              alt={room.roomNormalizedDescription}
              className="room-card__img"
            />

            <div className="room-card__details">
              <h3
                className="room-card__title"
                onClick={() => {
                  setSelectedRoom(room);
                  setImageIndex(0);
                }}
              >
                {room.roomNormalizedDescription}
              </h3>
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

            <button
              className="room-card__btn"
              onClick={() => {
                const uid = localStorage.getItem("uid");
                const paymentUrl =
                  `/payment-stripe?destination_name=${encodeURIComponent(destination_name)}` +
                  `&destination_id=${encodeURIComponent(destination)}` +
                  `&hotel=${encodeURIComponent(hotel.name)}` +
                  `&hotel_id=${encodeURIComponent(id)}` +
                  `&hotel_addr=${encodeURIComponent(hotel.address)}` +
                  `&checkin=${encodeURIComponent(checkinParam)}` +
                  `&checkout=${encodeURIComponent(checkoutParam)}` +
                  `&adults=${encodeURIComponent(adultsParam)}` +
                  `&children=${encodeURIComponent(childrenParam)}` +
                  `&price=${room.converted_price.toFixed(0)}` +
                  `&room_name=${encodeURIComponent(room.roomNormalizedDescription)}` +
                  `&nights=${encodeURIComponent(nights)}`;

                if (!uid) {
                  navigate('/login', {
                    state: { from: location, afterLogin: paymentUrl }
                  });
                } else {
                  navigate(paymentUrl);
                }
              }}
            >
              Select
            </button>

            {selectedRoom && selectedRoom.key === room.key && (
              <div
                className={`modal-overlay show`}
                onClick={() => setSelectedRoom(null)}
              >
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

          </div>
        );
      })}

      {roomList.length > initialVisible && (
        <button
          className="see-more-rooms"
          onClick={() => setShowAllRooms((prev) => !prev)}
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
    </section>
  );
}