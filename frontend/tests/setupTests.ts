import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock config module to avoid import.meta.env issues
jest.mock('../src/config', () => ({
  config: {
    apiUrl: 'http://localhost:4000',
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllTimers();
});

