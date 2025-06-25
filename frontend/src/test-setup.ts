// src/test-setup.ts - FIXED VERSION
import '@testing-library/jest-dom';

// Proper localStorage mock that implements Storage interface
class LocalStorageMock implements Storage {
  private store: { [key: string]: string } = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  getItem = jest.fn((key: string): string | null => {
    return this.store[key] || null;
  });

  setItem = jest.fn((key: string, value: string): void => {
    this.store[key] = String(value);
  });

  removeItem = jest.fn((key: string): void => {
    delete this.store[key];
  });

  clear = jest.fn((): void => {
    this.store = {};
  });

  key = jest.fn((index: number): string | null => {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  });

  // Reset method for testing
  reset(): void {
    this.store = {};
    jest.clearAllMocks();
  }
}

const localStorageMock = new LocalStorageMock();

// Apply mocks to global
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response)
);

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
})) as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Export the mock for use in tests
export { localStorageMock };