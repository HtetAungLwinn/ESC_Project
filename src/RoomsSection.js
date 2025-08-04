import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const initialVisible = 2;
  const totalGuests = adultsParam + childrenParam;

  const visibleRooms = showAllRooms
    ? roomList
    : roomList.slice(0, initialVisible);

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
              onClick={() =>
                navigate(
                  `/payment-stripe?destination_name=${encodeURIComponent(
                    destination_name
                  )}` +
                    `&destination_id=${encodeURIComponent(destination)}` +
                    `&hotel=${encodeURIComponent(hotel.name)}` +
                    `&hotel_id=${encodeURIComponent(id)}` +
                    `&hotel_addr=${encodeURIComponent(hotel.address)}` +
                    `&checkin=${encodeURIComponent(checkinParam)}` +
                    `&checkout=${encodeURIComponent(checkoutParam)}` +
                    `&adults=${encodeURIComponent(adultsParam)}` +
                    `&children=${encodeURIComponent(childrenParam)}` +
                    `&price=${room.converted_price.toFixed(0)}` +
                    `&room_name=${encodeURIComponent(
                      room.roomNormalizedDescription
                    )}` +
                    `&nights=${encodeURIComponent(nights)}`
                )
              }
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
                        src={
                          selectedRoom.images?.[imageIndex]?.high_resolution_url ||
                          HOTEL_PLACEHOLDER
                        }
                        alt={`Room Image ${imageIndex + 1}`}
                      />
                      {selectedRoom.images?.length > 1 && (
                        <>
                          <button
                            className="carousel-left"
                            onClick={() =>
                              setImageIndex(
                                (prev) =>
                                  (prev - 1 + selectedRoom.images.length) %
                                  selectedRoom.images.length
                              )
                            }
                          >
                            &#10094;
                          </button>
                          <button
                            className="carousel-right"
                            onClick={() =>
                              setImageIndex((prev) => (prev + 1) % selectedRoom.images.length)
                            }
                          >
                            &#10095;
                          </button>
                          <div className="image-count">
                            {imageIndex + 1} / {selectedRoom.images.length}
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      className="room-modal-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(null);
                      }}
                    >
                      &times;
                    </button>
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