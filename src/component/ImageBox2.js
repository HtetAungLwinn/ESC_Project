import React, { useState } from "react";
const HOTEL_PLACEHOLDER = "/photos/hotelplaceholder.png";

const ImageBox2 = ({ hotel }) => {
  const prefix = hotel?.image_details?.prefix || '';
  const suffix = hotel?.image_details?.suffix || '';
  const defaultIndex = hotel?.image_details?.default_image_index || 0;
  const count = hotel?.image_details?.count || 0;
  const imageIndexes = (hotel?.hires_image_index || '').split(',').slice(0, count).map(Number).filter((n) => !isNaN(n));
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);

  const [hasError, setHasError] = useState(false);

  const imageSrc = imageIndexes.length > 0 && currentIndex < imageIndexes.length
      ? `${prefix}${imageIndexes[currentIndex]}${suffix}`
      : HOTEL_PLACEHOLDER;

  return (
    <section className="gallery" style={{ maxWidth: 600, margin: "auto", position: "relative" }}>
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
        <img
          src={hasError ? HOTEL_PLACEHOLDER : imageSrc}
          alt={`Hotel image ${currentIndex}`}
          onError={() => setHasError(true)}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
    </section>
  );
};

export default ImageBox2;