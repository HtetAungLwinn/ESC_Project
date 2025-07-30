import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function BookingDetailsPage(){
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState([]);
    const [loading, setLoading] = useState(true);
    const[error, setError] = useState(false);
    const userId = localStorage.getItem("uid"); 

    useEffect(() => {
    fetch(`/api/bookings?uid=${userId}`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => setError(true))
      .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading bookings...</p>
    if (error) return <p>Error loading bookings...</p>
    if (bookings.length == 0) return <p>No bookings found...</p>

    return (
    <div className="bookings-container">
      <h2>Your Bookings</h2>
      {bookings.map((booking) => (
        <div className="room-card" key={booking.id}>
          <img src={booking.thumbnail || "/photos/hotelplaceholder.png"} />
          <h3>{booking.hotelName}</h3>
          <p>{booking.checkin} – {booking.checkout}</p>
          <p>Guests: {booking.adults} Adults, {booking.children} Children</p>
          <p>SGD {booking.totalPrice}</p>
          <button onClick={() => setSelectedBooking(booking)}>Details</button>
        </div>
      ))}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h2>{selectedBooking.hotelName}</h2>
            <p>Booking ID: {selectedBooking.id}</p>
            <p>Check-in: {selectedBooking.checkin}</p>
            <p>Check-out: {selectedBooking.checkout}</p>
            <p>Guests: {selectedBooking.adults} Adults, {selectedBooking.children} Children</p>
            <p>Total: SGD {selectedBooking.totalPrice}</p>
            <button onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );

}