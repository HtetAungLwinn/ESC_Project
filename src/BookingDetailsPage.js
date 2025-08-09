import React, { useState, useEffect } from 'react';

export default function BookingDetailsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const userId = localStorage.getItem("uid"); 
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings?uid=${userId}`);
      
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch bookings');
        }
      
        const bookingsData = await res.json();
      
        // Handle null or unexpected type
        if (!bookingsData || !Array.isArray(bookingsData)) {
          setBookings([]); // null → empty
          return;
        }
      
        setBookings(bookingsData);
      } catch (err) {
        if (err.message.includes("No bookings found")) {
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

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error loading bookings...</p>;
  if (!bookings || bookings.length === 0) return <p>No bookings found...</p>;

  return (
    <div>
      <h2>Your Bookings</h2>
      {bookings.map((booking) => {
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
