import '@testing-library/jest-dom';

// Suppress React act() warnings
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning: An update') && args[0]?.includes?.('not wrapped in act')) {
    return;
  }
  originalError.call(console, ...args);
};
