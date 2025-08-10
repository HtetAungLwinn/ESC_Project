// jest.setup.js
import '@testing-library/jest-dom';

// jest.setup.js
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder in Jest environment (Node.js)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
