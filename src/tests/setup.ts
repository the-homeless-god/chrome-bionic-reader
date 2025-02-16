import { chrome } from './mocks/chrome';
import config from '@/config';
import { pipe } from 'fp-ts/function';

Object.defineProperty(global, 'chrome', {
  value: chrome,
  writable: true,
});

Object.defineProperty(global, 'config', {
  value: config,
  writable: true,
});

Object.defineProperty(global, 'pipe', {
  value: pipe,
  writable: true,
});

// Mock MutationObserver
global.MutationObserver = class {
  observe() {}
  disconnect() {}
  takeRecords() { return [] }
};

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}; 
