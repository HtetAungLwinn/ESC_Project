import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';


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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    const uid = localStorage.getItem('uid');
    const user = auth.currentUser;

    try {
      const email = user.email;
      const password = prompt("Please re-enter your password to confirm account deletion:");

      if (!password) return;

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      // 1. Call backend to delete user data
      const res = await fetch(`http://localhost:5000/api/deleteAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Backend delete failed');

      // 2. Delete user from Firebase Auth
      await user.delete();

      // 3. Log out and redirect
      localStorage.removeItem('uid');
      localStorage.removeItem('user');
      setLoggedIn(false);
      navigate('/');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    }
  };
  

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: 0, right: 0, margin: '1rem', padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        onClick={handleDeleteAccount}
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
