import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageBox2 from '../component/ImageBox2'; // <- adjust path if needed

// helper to build a hotel object
const makeHotel = ({
  prefix = 'https://cdn.example.com/h_',
  suffix = '.jpg',
  count = 3,
  hires = '10,20,30',
  defaultIdx = 1,
} = {}) => ({
  image_details: {
    prefix,
    suffix,
    count,
    default_image_index: defaultIdx,
  },
  hires_image_index: hires,
});

describe('ImageBox2', () => {
  test('builds src from prefix + selected hires index + suffix using default_image_index', () => {
    // defaultIdx=1 -> picks second element of [10,20,30] = 20
    const hotel = makeHotel({ defaultIdx: 1 });
    render(<ImageBox2 hotel={hotel} />);
    const img = screen.getByRole('img', { name: 'Hotel image 1' });
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/h_20.jpg');
  });

  test('filters non-numeric hires entries before selecting', () => {
    // hires "10,abc,30" -> [10, 30]; defaultIdx=1 selects 30
    const hotel = makeHotel({ hires: '10,abc,30', count: 3, defaultIdx: 1 });
    render(<ImageBox2 hotel={hotel} />);
    const img = screen.getByRole('img', { name: 'Hotel image 1' });
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/h_30.jpg');
  });

  test('uses placeholder when no hires indexes', () => {
    const hotel = makeHotel({ hires: '', count: 3 });
    render(<ImageBox2 hotel={hotel} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('/photos/hotelplaceholder.png');
  });

  test('uses placeholder when default index is out of range', () => {
    // hires has length 2, defaultIdx=5 => out of range
    const hotel = makeHotel({ hires: '5,6', count: 2, defaultIdx: 5 });
    render(<ImageBox2 hotel={hotel} />);
    const img = screen.getByRole('img', { name: 'Hotel image 5' });
    expect(img.getAttribute('src')).toContain('/photos/hotelplaceholder.png');
  });

  test('falls back to placeholder on image load error', () => {
    const hotel = makeHotel();
    render(<ImageBox2 hotel={hotel} />);
    const img = screen.getByRole('img');
    // trigger onError -> sets hasError true -> swaps to placeholder
    fireEvent.error(img);
    expect(img.getAttribute('src')).toContain('/photos/hotelplaceholder.png');
  });
});
