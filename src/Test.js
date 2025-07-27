import React, { useState, useEffect } from "react"; // Import useEffect for the escape key
import "./css/HotelDetailsPage.css"; // Make sure your CSS is imported

export default function TestModal() {
  const [showModal, setShowModal] = useState(true); // Keep this true to show modal by default for testing
  const [imageIndex, setImageIndex] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
  ];

  // Effect to handle body scroll lock and escape key
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'; // Lock body scroll when modal is open
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
      document.body.style.overflow = ''; // Unlock body scroll when modal is closed
    }
  }, [showModal]); // Dependency array: run effect when showModal changes

  if (!showModal) return null; // Render nothing if showModal is false

  return (
    // Apply the 'show' class conditionally to the overlay for CSS transitions
    <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={() => setShowModal(false)}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* <button
        className="modal-close"
        onClick={e => {
          e.stopPropagation(); // Prevent click from bubbling to overlay
          setShowModal(false);
        }}
      >
    <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>&times;</span>
      </button> */}
        <div className="room-modal-content">
          <div className="modal-image-carousel">
            <img
              src={images[imageIndex]}
              alt={`Room Image ${imageIndex + 1}`}
            />
            {/* Show carousel navigation only if there's more than one image */}
            {images.length > 1 && (
              <>
                <button
                  className="carousel-left"
                  onClick={() => setImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                >
                  &#10094;
                </button>
                <button
                  className="carousel-right"
                  onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                >
                  &#10095;
                </button>
                <div className="image-count">
                  {imageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          <div className="modal-room-info">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h2>Sample Room Title</h2>
                <button className="room-modal-close" onClick={e => {
          e.stopPropagation(); // Prevent click from bubbling to overlay
          setShowModal(false);
        }}>&times;</button>
            </div>
            {/* <h2>Sample Room Title</h2> */}
            {/* Add optional subtitle/beds/size info if you had mock data for it */}
            <div className="scrollable-room-content">
                <p className="room-subtitle">Beds: 1 King, 1 Sofa</p>
                <p className="room-subtitle">Size: 1200 sq. ft.</p>
                <div className="room-details">
                <p>Room description and details go here. Scroll to see more content.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam eros, a bibendum enim enim eu sem.</p>
                <p>More details: This is a long paragraph to test scrolling within the modal. It should demonstrate how the content will behave when it exceeds the available height. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p>Another paragraph to ensure there's enough content to trigger scrollbars if needed. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                <ul>
                    <li>Bullet point 1: Feature A</li>
                    <li>Bullet point 2: Feature B</li>
                    <li>Bullet point 3: Feature C</li>
                </ul>
                <p>Final paragraph for the mock content. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}