import React from 'react';
import ImageBox from './component/ImageBox';
import ImageBox2 from './component/ImageBox2';

export default function GallerySection({ hotel }) {
  return (
    <section className="gallery">
      {hotel && hotel.image_details && hotel.hires_image_index ? (
        <ImageBox hotel={hotel} />
      ) : (
        <ImageBox2 hotel={hotel} />
      )}
    </section>
  );
}
