import React, { useState } from "react";

const ImageBox = ({ hotel }) => {
  const prefix = hotel.image_details.prefix;
  const suffix = hotel.image_details.suffix;
  const imageIndexes = hotel.hires_image_index.split(',').slice(0, hotel.image_details.count).map(Number);
  const [currentIndex, setCurrentIndex] = useState(hotel.image_details.default_image_index || 0);

  const total = imageIndexes.length;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <section className="gallery" style={{ maxWidth: 400, margin: "auto", position: "relative" }}>
      <div
        style={{
          position: "relative",
          border: "1px solid #ccc",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#f9f9f9",
          height: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Image */}
        <img
          src={`${prefix}${imageIndexes[currentIndex]}${suffix}`}
          alt={`Hotel image ${currentIndex}`}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />

        {/* Left arrow */}
        <button
          onClick={goPrev}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            cursor: "pointer",
          }}
        >
          ◀
        </button>

        {/* Right arrow */}
        <button
          onClick={goNext}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            cursor: "pointer",
          }}
        >
          ▶
        </button>

        {/* Image index (bottom left) */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {currentIndex + 1} / {total}
        </div>
      </div>
    </section>
  );
};

export default ImageBox;
