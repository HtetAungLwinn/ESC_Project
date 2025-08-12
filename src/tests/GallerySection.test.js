import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the children so we can detect which one renders
jest.mock('../component/ImageBox', () => () => <div data-testid="ImageBox" />);
jest.mock('../component/ImageBox2', () => () => <div data-testid="ImageBox2" />);

import GallerySection from '../GallerySection';

const hotelBase = {
  name: 'Hotel',
  image_details: { prefix: 'p/', suffix: '.jpg', count: 3, default_image_index: 0 },
};

test('renders ImageBox when hotel has image_details and hires_image_index', () => {
  const hotel = { ...hotelBase, hires_image_index: '1,2,3' };
  render(<GallerySection hotel={hotel} />);
  expect(screen.getByTestId('ImageBox')).toBeInTheDocument();
  expect(screen.queryByTestId('ImageBox2')).toBeNull();
});

test('renders ImageBox2 when hires_image_index is missing/empty', () => {
  render(<GallerySection hotel={{ ...hotelBase, hires_image_index: '' }} />);
  expect(screen.getByTestId('ImageBox2')).toBeInTheDocument();

  render(<GallerySection hotel={{ ...hotelBase, hires_image_index: null }} />);
  expect(screen.getAllByTestId('ImageBox2').length).toBeGreaterThan(0);
});
