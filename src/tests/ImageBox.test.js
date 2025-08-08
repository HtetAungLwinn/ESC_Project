import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageBox from '../component/ImageBox'; 

// helper to build the hotel object the component expects
const makeHotel = ({
  prefix = 'https://cdn.example.com/h_',
  suffix = '.jpg',
  count = 7,
  hires = '1,2,3,4,5,6,7,8,9',
} = {}) => ({
  image_details: { prefix, suffix, count },
  hires_image_index: hires,
});

describe('ImageBox', () => {
  test('renders up to count thumbnails with correct srcs', () => {
    const hotel = makeHotel({ count: 7, hires: '1,2,3,4,5,6,7,8,9' });
    render(<ImageBox hotel={hotel} />);

    const thumbs = screen.getAllByAltText(/Hotel \d+/i);
    expect(thumbs).toHaveLength(7);
    expect(thumbs[0]).toHaveAttribute('src', 'https://cdn.example.com/h_1.jpg');
    expect(thumbs[6]).toHaveAttribute('src', 'https://cdn.example.com/h_7.jpg');
  });

  test('left/right nav buttons enable/disable as you scroll', () => {
    // total=7, visibleCount=5 -> maxScrollIndex = 2
    const hotel = makeHotel({ count: 7 });
    render(<ImageBox hotel={hotel} />);

    const leftBtn = screen.getByText('◀');
    const rightBtn = screen.getByText('▶');

    expect(leftBtn).toBeDisabled();
    expect(rightBtn).not.toBeDisabled();

    fireEvent.click(rightBtn); // index 1
    expect(leftBtn).not.toBeDisabled();
    expect(rightBtn).not.toBeDisabled();

    fireEvent.click(rightBtn); // index 2 (max)
    expect(rightBtn).toBeDisabled();
  });

  test('slider track translates when clicking next', () => {
    const hotel = makeHotel({ count: 7 });
    const { container } = render(<ImageBox hotel={hotel} />);
    const track = container.querySelector('.square-slider-track');
    expect(track.style.transform).toContain('translateX(-0px)');

    fireEvent.click(screen.getByText('▶')); // move to index 1
    // imageWidth 180 + imageGap 10 = 190px shift
    expect(track.style.transform).toContain('translateX(-190px)');
  });

  test('opens modal on thumb click and closes via ✕ and overlay', () => {
    const hotel = makeHotel({ count: 3, hires: '1,2,3' });
    const { container } = render(<ImageBox hotel={hotel} />);

    // open on second image
    fireEvent.click(screen.getByAltText('Hotel 2'));
    expect(screen.getByAltText('Modal 2')).toBeInTheDocument();

    // close via ✕
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByAltText('Modal 2')).not.toBeInTheDocument();

    // open again and close via overlay
    fireEvent.click(screen.getByAltText('Hotel 2'));
    const overlay = container.querySelector('.modal-overlay');
    fireEvent.click(overlay);
    expect(screen.queryByAltText('Modal 2')).not.toBeInTheDocument();
  });

  test('modal next/prev wrap around correctly', () => {
    const hotel = makeHotel({ count: 3, hires: '1,2,3' });
    const { container } = render(<ImageBox hotel={hotel} />);

    // open modal at first image
    fireEvent.click(screen.getByAltText('Hotel 1'));
    const modal = container.querySelector('.modal-content');
    const next = within(modal).getByText('▶');
    const prev = within(modal).getByText('◀');

    expect(screen.getByAltText('Modal 1')).toBeInTheDocument();

    fireEvent.click(next);
    expect(screen.getByAltText('Modal 2')).toBeInTheDocument();

    fireEvent.click(next);
    expect(screen.getByAltText('Modal 3')).toBeInTheDocument();

    fireEvent.click(next); // wrap -> 1
    expect(screen.getByAltText('Modal 1')).toBeInTheDocument();

    fireEvent.click(prev); // wrap -> 3
    expect(screen.getByAltText('Modal 3')).toBeInTheDocument();
  });

  test('falls back to placeholder when a thumb or modal image errors', () => {
    const hotel = makeHotel({ count: 2, hires: '10,20' });
    render(<ImageBox hotel={hotel} />);

    const thumb1 = screen.getByAltText('Hotel 1');
    fireEvent.error(thumb1);
    expect(thumb1.getAttribute('src')).toContain('/photos/hotelplaceholder.png');

    fireEvent.click(screen.getByAltText('Hotel 2'));
    const modalImg = screen.getByAltText('Modal 2');
    fireEvent.error(modalImg);
    expect(modalImg.getAttribute('src')).toContain('/photos/hotelplaceholder.png');
  });
});
