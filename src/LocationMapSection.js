import React from 'react';
import HotelMap from './component/HotelMap';

export default function LocationMapSection({ hotel }) {
  return hotel.latitude && hotel.longitude ? (
    <section className="location-map">
      <h2>Location</h2>
      <HotelMap
        latitude={hotel.latitude}
        longitude={hotel.longitude}
        name={hotel.name}
      />
    </section>
  ) : null;
}