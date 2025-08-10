import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleDeleteAccount } from './DeleteAccount';


export default function BookingDetailsPage({ setLoggedIn }){
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState([]);
  const [hotelInfos, setHotelInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState(false);
  const userId = localStorage.getItem("uid"); 
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings?uid=${userId}`);
      
        if (!res.ok) {
          // get error message from server
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch bookings');
        }
      
        const bookingsData = await res.json();
      
        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
        } else {
          console.error("Unexpected bookings format:", bookingsData);
          setBookings([]);
        }
      } catch (err) {
        if (err.message.includes("No bookings found")) {
          // Backend says no bookings, show empty list
          setBookings([]);
        } else {
          console.error("Error fetching bookings:", err);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };


    fetchBookings();
  }, [userId]);

  
  

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: 0, right: 0, margin: '1rem', padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        onClick={() => handleDeleteAccount({setLoggedIn, navigate})}
      >
        Delete Account
      </button>
      <h2>Your Bookings</h2>
      {loading && <p>Loading bookings...</p>}
      {error && <p>Error loading bookings...</p>}
      {!loading && !error && bookings.length === 0 && <p>No bookings found...</p>}
      {!loading && !error && Array.isArray(bookings) && bookings.length > 0 && bookings.map((booking) => {
        return (
          <div
            key={booking.hotel_name}
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginBottom: '1rem'
            }}
          >
            <h3>{booking.hotel_name}</h3>
            <p>
              Room: {booking.stay_info.room_type}<br />
              Address: {booking.hotel_addr}<br />
              Price: {booking.price}<br />
              Check-in: {new Date(booking.start_date).toISOString().split("T")[0]} <br />
              Check-out: {new Date(booking.end_date).toISOString().split("T")[0]} <br />
              Adults: {booking.stay_info.adults} <br />
              Children: {booking.stay_info.children} <br />
              Message to hotel: {booking.message_to_hotel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
