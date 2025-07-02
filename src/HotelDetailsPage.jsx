import React from 'react';
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
import './HotelDetailsPage.css';


const amenities = [
  'Air Conditioning', 'Business Center', 'Clothing Iron', 'Data Ports',
  'Dry Cleaning', 'Hair Dryer', 'Meeting Rooms', 'Outdoor Pool',
  'Parking Garage', 'Safe', 'Room Service', 'TV in Room', 'Voicemail'
];

const rooms = [
  { id: 1, title: 'King Deluxe Room', description: 'Spacious room with king bed, city views.', price: '$2,024', guests: '2 Adults', image: '/images/room1.jpg' },
  { id: 2, title: 'Queen Superior Room', description: 'Cozy room with queen bed and premium amenities.', price: '$2,024', guests: '2 Adults', image: '/images/room2.jpg' }
];

const reviews = [
  { id: 1, rating: 5, text: 'Sleep deprived', reviewer: 'SUTD student' },
  { id: 2, rating: 4, text: 'Great location but noisy at night', reviewer: 'John D.' },
  { id: 3, rating: 5, text: 'Excellent service and amenities!', reviewer: 'Lisa W.' }
];

export default function HotelDetailsPage() {
  return (
    <div className="hotel-page">
      {/* Header with icon, title, and auth links */}
      <div className="header">
        <div className="header-left">
          <Plane size={28} />
          <div className="header-title">OCBC Travel</div>
        </div>
        <div className="header-actions">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </div>

      <section className="search-bar">
        <div className="search-item">
          <FiMapPin /> <span>Singapore</span> <FiChevronDown />
        </div>
        <div className="search-item">07 Jul 2024</div>
        <div className="search-item">10 Jul 2024</div>
        <div className="search-item">1 Room | 2 Adults</div>
        <button className="btn-search">Search Again</button>
      </section>

      <section className="gallery">
        <div className="gallery-main">
          <img src="/images/main.jpg" alt="Main view" />
        </div>
        <div className="gallery-side">
          <img src="/images/side1.jpg" alt="Side view 1" />
          <img src="/images/side2.jpg" alt="Side view 2" />
          <img src="/images/side3.jpg" alt="Side view 3" />
        </div>
      </section>

      <section className="content-section">
        <div className="overview">
          <h1>The Fullerton Hotel Singapore</h1>
          <div className="stars">
            {Array(5).fill(<AiFillStar />)}
          </div>
          <p className="address">
            <FiMapPin /> 1 Fullerton Square, 049178 Singapore — <a href="#">show map</a>
          </p>
          <h2>Overview</h2>
          <p>With a stay at The Fullerton Hotel Singapore, you’ll be centrally located in Singapore. 
          </p>
          <p>
            thank you kenny for extending the deadline. this needs more yap. lets see how long this goes because i have no clue how this works
          </p>
          <p>
            how does one limit width here
          </p>
          {/* Additional paragraphs here */}
        </div>
        <aside className="highlights">
          <h3>Highlights</h3>
          <ul>
            <li>Location rating: 96%</li>
            <li>Wellness rating: 95%</li>
            <li>WiFi rating: 87%</li>
            <li>Staff service: 91%</li>
          </ul>
        </aside>
      </section>

      <section className="amenities">
        <h3>Amenities</h3>
        <div className="amenities-grid">
          {amenities.map((item) => (
            <div key={item} className="amenity-item">{item}</div>
          ))}
        </div>
      </section>

      <section className="reviews">
        <h2>Reviews</h2>
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="stars">
                {Array(review.rating).fill().map((_, i) => (
                  <AiFillStar key={i} />
                ))}
              </div>
              <p className="review-text">{review.text}</p>
              <p className="reviewer">— {review.reviewer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rooms">
        <h2>Room Options</h2>
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <img src={room.image} alt={room.title} />
            <div className="room-info">
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <div className="room-footer">
                <span>{room.guests}</span>
                <button className="btn-select">Select</button>
                <span className="price">{room.price}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="see-more">
          <FiChevronDown /> See More Rooms
        </div>
      </section>

      <section className="location-map">
        <h2>Location</h2>
        <iframe
          title="hotel location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.4076528032153!2d103.85195688857208!3d1.2847653812127817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da19090f9c176f%3A0x41c12c50babf70d0!2sThe%20Fullerton%20Hotel%20Singapore!5e0!3m2!1sen!2ssg!4v1751441283664!5m2!1sen!2ssg" 
          width="100%" 
          height="400" 
          style={{ border: 0 }} 
          allowfullscreen
          loading="lazy" 
          // referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
}