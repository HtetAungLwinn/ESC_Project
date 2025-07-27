import React, { useState } from "react";
import '../css/ImageBox.css';

const HOTEL_PLACEHOLDER = "/photos/hotelplaceholder.png";

const ImageBox = ({ hotel }) => {
  const prefix = hotel.image_details.prefix;
  const suffix = hotel.image_details.suffix;
  const imageIndexes = hotel.hires_image_index
    .split(',')
    .slice(0, hotel.image_details.count)
    .map(Number);

  const images = imageIndexes.map(index => `${prefix}${index}${suffix}`);
  const total = images.length;

  const visibleCount = 5;
  const imageWidth = 180;
  const imageGap = 10;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const maxScrollIndex = Math.max(total - visibleCount, 0);

  const goPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxScrollIndex));
  };

  const openModal = (index) => {
    setActiveIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const nextModal = () => {
    setActiveIndex(prev => (prev + 1) % total);
  };

  const prevModal = () => {
    setActiveIndex(prev => (prev - 1 + total) % total);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = HOTEL_PLACEHOLDER;
  };

  return (
    <div className="square-carousel-container">
      <button className="nav-button left" onClick={goPrev} disabled={currentIndex === 0}>◀</button>

      <div className="square-carousel-view">
        <div
          className="square-slider-track"
          style={{
            transform: `translateX(-${(imageWidth + imageGap) * currentIndex}px)`
          }}
        >
          {images.map((img, i) => (
            <div className="square-image" key={i} onClick={() => openModal(i)}>
              <img src={img} alt={`Hotel ${i + 1}`} onError={handleImageError}/>
            </div>
          ))}
        </div>
      </div>

      <button
        className="nav-button right"
        onClick={goNext}
        disabled={currentIndex >= maxScrollIndex}
      >
        ▶
      </button>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <button className="modal-nav left" onClick={prevModal}>◀</button>
            <img src={images[activeIndex]} alt={`Modal ${activeIndex + 1}`} className="modal-img" onError={handleImageError} />
            <button className="modal-nav right" onClick={nextModal}>▶</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBox;
